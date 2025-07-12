import { OnModuleInit } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io"

@WebSocketGateway()
export class WebsocketGateway implements OnModuleInit {
    @WebSocketServer()
    private server!: Server;

    onModuleInit() {
        this.server.on("connection", (socket) => {
            console.log(socket.id)
            console.log("connected")
        })
    }

    @SubscribeMessage("NewMessage")
    onNewMessage(@MessageBody() body: any){
        this.server.emit("onMessage", {
            msg: "New Message",
            content: body
        })
    }
}