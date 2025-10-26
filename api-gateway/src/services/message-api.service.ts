import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateMessageDto } from "../dto/createMessageDto";
import { firstValueFrom } from "rxjs";
import { GetChatMessagesDto } from "../dto/getChatMessagesDto";
import { ReadMessageDto } from "../dto/readMessageDto";


@Injectable()
export class MessageApiService{
    private readonly url: string;
    constructor(
        private readonly httpService: HttpService,
        private readonly cfg: ConfigService
    ) {
        this.url = this.cfg.get("MESSAGE_URL") ?? "http://100.126.70.46:3003";
    }

    private headers(userId: string) {
        const h: Record<string, string> = {"X-User-Id": userId};
        return h;
    }

    createOne(userId: string, msg: CreateMessageDto){
        return firstValueFrom(
            this.httpService.post(`${this.url}/messages/create-one`, msg, { headers: this.headers(userId) })
        ).then(res => res.data)
    }

    getChatMessages(userId: string, params: GetChatMessagesDto){
        return firstValueFrom(
            this.httpService.post(`${this.url}/messages/get-chat-messages`, params, { headers: this.headers(userId) })
        ).then(res => res.data)
    }

    markRead(userId: string, msgInfo: ReadMessageDto){
        return firstValueFrom(
            this.httpService.post(`${this.url}/messages/mark-read`, msgInfo, { headers: this.headers(userId) })
        ).then(res => res.data)
    }


}