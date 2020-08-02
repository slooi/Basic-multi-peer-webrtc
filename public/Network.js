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

        this.ws.addEventListener('message',e=>{
            console.log('message',e)
            if(this.peerList){

            }else{
                // THIS ONLY RUNS ONCE WHEN USER CONNECTS

                // Create peerList
                const peerList = JSON.parse(e.data)
                this.peerList = peerList

                // For each id in peerList, create connection


                //!@#!@#!@# need to complete
            }
        })
    }
    createConnection(){
        // ONLY RUN IF peerlist has something or got shiz from remote clients

        // !@#!@#!@# change later
        const id = this.peerList[0] // $$$$$
        this.connections[id] = new Connection(id,this.ws)
    }
    sendOffer(){
        // ONLY RUN IF peerlist has something or got shiz from remote clients
        // $$$$$
        const id = this.peerList[0] // $$$$$
        this.connections[id].sendOffer()
    }
}

class Connection{
    constructor(id,ws){
        this.pc
        this.id = id
        this.ws = ws

        this.setup()
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
                console.log('Your offer',session)
            }else{

        // !@#!@#!@# need to complete
            }
            await this.pc.setLocalDescription(session)
            this.ws.sendPayload(this.id,this.pc.localDescription)
            console.log()
        }catch(err){
            console.warn('ERROR:',err)
        }
    }
}


const config = {
    iceServers:[
        {urls: 'stun:stun.stunprotocol.org:3478'},
        {urls: 'stun:stun.l.google.com:19302'},
    ]
}