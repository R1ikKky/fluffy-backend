import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { CreateChatDto } from "../dto/createChat.dto";


@Injectable()
export class ChatApiService{
    private readonly url: string;
    constructor(
        private readonly httpService: HttpService,
        private readonly cfg: ConfigService
    ) {
        this.url = this.cfg.get("CHAT_URL") ?? "http://100.126.70.46:3004";
    }

    private headers(userId: string) {
        const h: Record<string, string> = {"X-User-Id": userId};
        return h;
    }

    getAllUsersChats(userId: string) {
        return firstValueFrom(
            this.httpService.get(`${this.url}/chat/get-all-users-chats`, { headers: this.headers(userId) })
        ).then(res => res.data)
    }

    getChatParticipants(chatId: string) {
        return firstValueFrom(
            this.httpService.post(`${this.url}/chat/get-chat-members`, chatId)
        ).then(res => res.data)
    }

    addMember(userId: string, chatId: string, role: "member" | "admin") {
        return firstValueFrom(                                 
            this.httpService.post(`${this.url}/chat/add-member`,{ chatId, role } , { headers: this.headers(userId) })
        ).then(res => res.data)
    }

    removeMember(chatId: string, userId: string) {
        return firstValueFrom(
            this.httpService.post(`${this.url}/chat/remove-member`, chatId, { headers: this.headers(userId) })
        ).then(res => res.data)
    }

    createChat(userId: string, data: CreateChatDto) {
        return firstValueFrom(
            this.httpService.post(`${this.url}/chat/create-chat`, data, { headers: this.headers(userId) })
        ).then(res => res.data)
        
    }
}