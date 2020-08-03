// Require
const express = require('express')
const ws = require('ws')
const https = require('https')
const http = require('http')
const path = require('path')
const fs = require('fs')
const PairHandler = require('./PairHandler.js')

// Setup
const app = express()

// Environment Variables/Constants
const PORT = 8443

// Application Variables/Constants
let idWebsocketPair = new PairHandler()
let idCounter = 0

// Middleware
app.use(express.static(path.resolve(__dirname,'public')))

// Routing
app.get('/',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'public','index.html'))
})


// Server
// const server = https.createServer({
//     cert:fs.readFileSync(path.resolve(__dirname,'cert.pem')),
//     key:fs.readFileSync(path.resolve(__dirname,'key.pem'))
// },app)
const server = http.createServer({},app)

server.listen(PORT,()=>console.log('Listening on port: '+PORT))


// Websocket
const wss = new ws.Server({server})

wss.on('connection',ws=>{
    console.log('NEW CONNECTION',idCounter+1)

    // Increment id counter and set id    
    idCounter++
    const id = idCounter
    
    // Give user list of all player ids
    ws.send(JSON.stringify([id,idWebsocketPair.getIdList()]))    // BEFORE YOU GIVE USER AN ID

    // Update pair
    idWebsocketPair.add(id,ws)
    
    // Event Listeners
    ws.on('message',unparsedPayload=>{
        // When receive payload, change id to sender's id,  then send to destination
        const payload = JSON.parse(unparsedPayload)
        const destId = payload[0]
        const data = payload[1]

        const destWs = idWebsocketPair.getWs(destId)
        if(destWs !== -1){
            const senderId = idWebsocketPair.getId(ws)
    
            // Modify payload
            const newPayload = JSON.stringify([senderId,data])
    
            // Send
            console.log('sending to destId:',destId)
            destWs.send(newPayload)
    
            console.log('payload',payload)
        }
    })
    ws.on('close',e=>{
        console.log('BEFORE',idWebsocketPair)
        idWebsocketPair.deleteByWs(ws)
        console.log('AFTER',idWebsocketPair)
    })
})


