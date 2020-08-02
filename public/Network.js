console.log('loaded Network.js')


class Network{
    constructor(){
        this.connections = {}
        this.ws
        this.peerList
        this.setup()
    }
    setup(){
        // Setup websocket
        this.ws = new WebSocket(location.origin.replace(/^http/,'ws'))
        // ws
        this.ws.sendPayload = (destId,data)=>{
            this.ws.send(JSON.stringify([destId,data]))
        }

        this.ws.addEventListener('message',this.handleSignallingServer)
    }
    createConnection(id=this.peerList[0]){
        // ONLY RUN IF peerlist has something or got shiz from remote clients


        // !@#!@#!@# change later
        this.connections[id] = new Connection(id,this.ws)
        return this.connections[id]
    }
    sendOffer(){
        // ONLY RUN IF peerlist has something or got shiz from remote clients
        // $$$$$
        const id = this.peerList[0] // $$$$$
        this.connections[id].sendOffer()
    }

    handleSignallingServer = e => 
    {
        console.log('message',e)
        if(this.peerList){
            // Two cases:
            // 1) A new peron is trying to establish a connection and has sent an offer
            // 2) You, the new person has sent an offer and you've got a reply
            // How do we tell them appart? => Only the "new person" has the remote peer in his peerList
            const payload = JSON.parse(e.data)
            console.log('payload',payload)

            const senderId = payload[0]
            const data = payload[1]
            if(this.peerList.indexOf(senderId) === -1){
                // you don't have senderId in your peerList => case 1)

                // Create a new connection with that senderId
                const connection = this.createConnection(senderId)
                connection.handleSignallingServer(data,false)


                // add senderId ? (might be good leaving it out for now for debugging purposes) !@#!@#!@#
            }else{
                // You are the new person, case 2)
                const connection = this.connections[senderId]
                connection.handleSignallingServer(data,true)
            }
        }else{
            // THIS ONLY RUNS ONCE WHEN USER CONNECTS

            // Create peerList
            const peerList = JSON.parse(e.data)
            this.peerList = peerList

            // For each id in peerList, create connection


            //!@#!@#!@# need to complete
        }
    }
}

class Connection{
    constructor(id,ws){
        this.pc
        this.id = id
        this.ws = ws

        this.setup()
        return this
    }
    setup(){
        // Setup peerconnection 
        this.pc = new RTCPeerConnection(config)

        // ice
        this.pc.onicecandidate = this.gotIceCandidate

    }
    sendOffer(){
        // create dataChannel
        // !@#!@#!@# need to complete

        // offer
        this.createSession(1)
    }
    gotIceCandidate = (e) =>{
        console.log('gotIceCandidate',e)
    }
    createSession = async (isOffer) =>{
        try{
            let session
            if(isOffer){
                session = await this.pc.createOffer()
            }else{
                session = await this.pc.createAnswer()
            }
            await this.pc.setLocalDescription(session)
            console.log('Your localDescription',this.pc.localDescription)
            this.ws.sendPayload(this.id,this.pc.localDescription)
        }catch(err){
            console.warn('ERROR:',err)
        }
    }
    handleSignallingServer = async (data,isOfferer) =>{
        // Set remoteDescription
        this.pc.setRemoteDescription(data)
            .then(_=>{
                console.log('Your remoteDescription',this.pc.remoteDescription)
                if(!isOfferer){
                    // Create answer
                    this.createSession(false)
                }
            })
            .catch(err=>console.warn(err))
    }
}


const config = {
    iceServers:[
        {urls: 'stun:stun.stunprotocol.org:3478'},
        {urls: 'stun:stun.l.google.com:19302'},
    ]
}