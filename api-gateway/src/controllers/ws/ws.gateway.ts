import { UnauthorizedException } from "@nestjs/common";
import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from "socket.io"
import * as fileSystem from 'fs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from "@nestjs/config";
import { WsUser } from "../../dto/wsUser.interface";
import { PresenceService } from "./presence.service";


@WebSocketGateway({namespace: "/", cors: {origin: "http://localhost:5173", credentials: true}})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server!: Server;

    private readonly clients = new Map<string, WsUser>();
    private readonly publicKey?: Buffer;

    constructor(
        private readonly presence: PresenceService,
        private readonly cfg: ConfigService,

    ){
        const pubPath = this.cfg.get<string>("JWT_PUBLIC");
        if (pubPath && fileSystem.existsSync(pubPath)) this.publicKey = fileSystem.readFileSync(pubPath);
    }

    async handleConnection(socket: Socket) {
        try{
            const token = this.getToken(socket);
            const payload = this.verifyJwt(token);
            const userId = String(payload.sub);

            let user = this.clients.get(userId);
            if(!user) {
                user = { id: userId, sockets: new Set() };
                this.clients.set(userId, user);
            }
            user.sockets.add(socket);

            await this.presence.markOnline(userId);

            socket.data.userId = userId;
            socket.emit('connected', { ok: true, userId });
            console.log(`✅ WS connected: ${userId} (${user.sockets.size})`);

        }catch(err: any){
            console.error("❌ WS auth failed:", err.message);
            socket.emit("error", "unauthorized");
            socket.disconnect();
        }
    }
    
    async handleDisconnect(socket: Socket) {
        const userId = socket.data.userId;
        if(!userId) return;

        const socketsList = this.clients.get(userId);
        if(!socketsList) return;

        socketsList.sockets.delete(socket);
        if(socketsList.sockets.size === 0) this.clients.delete(userId); 
        
        console.log(`❌ Socket ${userId} disconected (remain ${socketsList?.sockets.size ?? 0})`)
    }

    @SubscribeMessage("ping")
    async onPing(@ConnectedSocket() socket: Socket){
        const userId = socket.data.userId;
        if(!userId) return;
        await this.presence.markOnline(userId);
        socket.emit("pong", { time: Date.now() }) 
    }

    @SubscribeMessage("typing")
    async onTyping(
        @MessageBody() body: { chatId: string, typing: boolean },
        @ConnectedSocket() socket: Socket
    ){
        socket.broadcast.emit("typing", { from: socket.data.userId, ...body });
    }

    pushToUser(userId: string, event: string, payload: any){
        const socketsList = this.clients.get(userId);
        if(!socketsList) return;
        for (const s of socketsList.sockets) s.emit(event, payload);
    }

    pushToChat(userIds: string[], event: string, payload: any){
        for (const id of userIds) this.pushToUser(id, event, payload); 
    }


    private getToken(socket: Socket): string{
        const auth = socket.handshake.headers.authorization;
        if(auth && auth.startsWith("Bearer ")) return auth.slice(7);
        const queryToken = socket.handshake.query?.token;
        if(typeof queryToken === "string") return queryToken;
        throw new UnauthorizedException("no token bro");

    }

    private verifyJwt(token: string){
        if(!this.publicKey) throw new UnauthorizedException("no public key");
        return jwt.verify(token, this.publicKey, {algorithms: ["RS256"]})
    }

}