import { Controller } from "@nestjs/common";
import { ChatService } from "../services/chat.service";
import { MessagePattern, Payload } from "@nestjs/microservices";


@Controller()
export class MessageEventListener {
    constructor (private readonly chatService: ChatService) {}

    @MessagePattern("chat.get.participants")
    async getParticipants(@Payload() chatId: string): Promise<string[]> {
        const members = await this.chatService.getChatParticipants(chatId);
        return members;
    }

}