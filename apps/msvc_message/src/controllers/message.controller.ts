import { Body, Controller, Get, Headers, Post, Query } from "@nestjs/common";
import { MessageService } from "../services/message.service";
import { CreateMessageDto } from "../dto/createMessageDto";
import { ReadMessageDto } from "../dto/readMessageDto";

@Controller("messages")
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post("create-one")
    create(@Headers("X-User-Id") userId: string, @Body() dto: CreateMessageDto) {
        return this.messageService.create(userId, dto);
    }

    @Get("list")
    list(@Headers("X-User-Id") userId: string, @Query("limit") limit?: number) {
        return this.messageService.getChatMessages(userId, limit);
    }

    @Post("mark-read")
    markRead(@Headers("X-User-Id") userId: string, @Body() dto: ReadMessageDto) {
        return this.messageService.markRead(userId, dto);
    }
}
