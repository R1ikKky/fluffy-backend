import { Socket } from 'socket.io';


export interface WsUser {
    id: string;
    sockets: Set<Socket>;
}