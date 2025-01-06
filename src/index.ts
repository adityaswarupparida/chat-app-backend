import { WebSocket, WebSocketServer } from "ws";

// Web socket server is live and listening at port 8080
const wss = new WebSocketServer({ port: 8080 });

let sockets: { 
    socket : WebSocket;
    roomId : string;
    userId : string;
} [] = [];

let socketUserMap = new Map<WebSocket, string>();

// Once connection is done, handlers are attached
wss.on("connection", (socket) => {
    console.log("connection entry")
    // message: { "type": "join", "payload": { "roomId": "71DF327", "userId": "Rony" } }
    // message: { "type": "chat", "payload": { "message": "Hey there" } }
    socket.on("message", (message) => {
        const parsedMsg = JSON.parse(message.toString());

        switch (parsedMsg.type) {
            case "join":
                console.log("chp #1: user joined the room");
                sockets.push({
                    socket,
                    roomId: parsedMsg.payload.roomId,
                    userId: parsedMsg.payload.userId
                });

                socketUserMap.set(socket, parsedMsg.payload.userId);
                // Inform in the room that user (=userId) joined
                sockets.forEach(skt => {
                    console.log("Check if entry is there: join");

                    if(skt.roomId === parsedMsg.payload.roomId) {
                        skt.socket.send(parsedMsg.payload.userId+" joined the chat");
                    }
                })
                break;

            case "chat":
                console.log("chp #2: user wants to chat");

                const roomToBeSent = sockets.find(skt => skt.socket == socket)?.roomId;
                sockets.forEach(skt => {
                    console.log("Check if entry is there: chat");
                    if(skt.roomId === roomToBeSent) {
                        skt.socket.send(parsedMsg.payload.message);
                    }
                })
                break;
        
            default:
                break;
        }
    })
    
    // Once the socket is closed, remove the socket from that room
    socket.on("close", () => {
        console.log("chp #3: user left the room");

        const roomToBeSent = sockets.find(skt => skt.socket == socket)?.roomId;
        sockets.forEach(skt => {
            console.log("Check if entry is there: close");

            if(skt.roomId === roomToBeSent) {
                skt.socket.send(socketUserMap.get(socket)+" left the chat");
            }
        })
        sockets = sockets.filter(skt => skt.socket != socket);
    })
})