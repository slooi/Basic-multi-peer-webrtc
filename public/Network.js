console.log('loaded Network.js')


class Network{
    constructor(){
        this.connections = {}
        this.ws
        this.localId
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
    establishConnectionList(){
        // Tries to ESTABLISH a connection with all peers in peerList
        this.peerList.forEach(id=>{
            this.createConnection(id)
            this.sendOffer(id)
        })
    }
    createConnection(remoteId=this.peerList[0]){  // $$$$$$$$$$
        const connection = new Connection(this.localId,remoteId,this.ws)
        this.connections[remoteId] = connection

        return connection
    }
    sendOffer(remoteId=this.peerList[0]){  // $$$$$
        this.connections[remoteId].sendOffer()
    }

    handleSignallingServer = e => 
    {
        console.log('handleSignallingServer e.data:',e.data)
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
            const data =  JSON.parse(e.data)

            // Extract data (localId, peerList)
            this.localId = data[0]
            this.peerList = data[1]

            console.log('Your are: ',this.localId)
        }
    }
}

class Connection{
    constructor(localId,remoteId,ws){
        this.pc
        this.localId = localId
        this.remoteId = remoteId
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
            console.log('Connection to: ',this.remoteId,', has localDescription of:',this.pc.localDescription)
            this.ws.sendPayload(this.remoteId,this.pc.localDescription)
        }catch(err){
            console.warn('ERROR:',err)
        }
    }
    handleSignallingServer = async (data,isOfferer) =>{
        //!@#!@#!@# handle for ice

        if(data.sdp){
            // Set remoteDescription
            this.pc.setRemoteDescription(data)
                .then(_=>{
                    console.log('Connection to: ',this.remoteId,', has remoteDescription of:',this.pc.remoteDescription)
                    if(!isOfferer){
                        // Create answer
                        this.createSession(false)
                    }
                })
                .catch(err=>console.warn(err))
        }else if(data.ice){

        }else{
            console.warn('ERROR: this should not be happening! Make sure not to send anything from remote client if candidate == undefined')
        }
    }
}


const config = {
    iceServers:[
        {urls: 'stun:stun.stunprotocol.org:3478'},
        {urls: 'stun:stun.l.google.com:19302'},
    ]
}