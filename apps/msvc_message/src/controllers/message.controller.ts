import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { MessageService } from "../services/message.service";
import { CreateMessageDto } from "../dto/createMessageDto";
import { ReadMessageDto } from "../dto/readMessageDto";
import { GetChatMessagesDto } from "../dto/getChatMessagesDto";

@Controller("messages")
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post("create-one")
    create(@Headers("X-User-Id") userId: string, @Body() dto: CreateMessageDto) {
        return this.messageService.createMessage(userId, dto);
    }

    @Get("get-chat-messages")
    list(@Headers("X-User-Id") userId: string, @Body() dto: GetChatMessagesDto) {
        return this.messageService.getChatMessages(userId, dto.page, dto.limit);
    }

    @Post("mark-read")
    markRead(@Headers("X-User-Id") userId: string, @Body() dto: ReadMessageDto) {
        return this.messageService.markRead(userId, dto);
    }
}
 