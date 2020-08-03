# Basic-multi-peer-webrtc
 - Basic multi-peer webrtc test app
 - Can handle more 2+ peer connections
 - Works on heroku

# How to use
Don't change server signalling (websocket) related code and Network.js code. 
Use Network class to communicate with other peers through either: network.broadcast(yourData) or network.send(remoteId,yourData)
