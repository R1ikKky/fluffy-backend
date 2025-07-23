import { Injectable, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from "@nestjs/websockets";
import { Socket } from "socket.io"
import Redis from "ioredis";


const ONLINE_KEY = (id: string) => `online:${id}`;
const TTL = 30;

@Injectable()
@WebSocketGateway({path: "/ws", cors: {origin: "*", credentials: true}})
export class WsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    // private server!: Server;

    private socketMap: Map<string, Set<Socket>> = new Map();

    constructor(
        private readonly jwt: JwtService,
        @Inject("REDIS") private readonly redis: Redis
    ){}

    afterInit() {
        console.log("WebSocket server initialised");
    }

    async handleConnection(client: Socket) {
        try{
            const token = client.handshake.auth.token;
            const payload: any = this.jwt.verify(token as string);
            const userId = payload.sub as string;
            client.data.userId = userId;

            if(!this.socketMap.has(userId)){
             this.socketMap.set(userId, new Set());
            } this.socketMap.get(userId)!.add(client);
            
            await this.redis.set(ONLINE_KEY(userId), process.env.HOSTNAME ?? "GW", "EX", TTL );

            client.on("client.ping", async () => {
                client.emit("server.pong")
                await this.redis.set(ONLINE_KEY(userId), process.env.HOSTNAME ?? "GW", "EX", TTL);
            });

            console.log(`User ${userId} connected (${client.id})`);
        }catch(err){
            client.emit("error", "unauthorized");
            client.disconnect(true);
        }
    }
    
    async handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if(userId && this.socketMap.has(userId)){
            const set = this.socketMap.get(userId)!;
            set.delete(client);
            if(set.size === 0) this.socketMap.delete(userId)
        }
        console.log(`Socket ${client.id} disconected`)
    }

    pushToChat(chatId: string, payload: any){
        let delivered = 0;

        for(const Sockets of this.socketMap.values()){
            for(const socket of Sockets){
                if(socket.data.chats?.has(chatId)){
                    socket.emit("chat.message", payload);
                    delivered++;
                }
            }
        }
        return delivered;
    }

    @SubscribeMessage("subscribe.chat")
    handleSubChat(
        @MessageBody() body: {chatId: string},
        @ConnectedSocket() client:Socket,
    ){
        if(!client.data.chats) client.data.chats = new Set();
        client.data.chats.add(body.chatId);
    }

    @SubscribeMessage("unsubscribe.chat")
    handleUnsubChat(
        @MessageBody() body: {chatId: string},
        @ConnectedSocket() client:Socket,
    ){
        client.data.chats?.delete(body.chatId);
    }

}