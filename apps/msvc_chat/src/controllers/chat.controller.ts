import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { ChatService } from "../services/chat.service";
import { CreateChatDto } from "../dto/createChat.dto";

@Controller("chat")
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Get("get-all-users-chats")
    GetAllUsersChats(@Headers("X-User-Id") userId: string) {
        return this.chatService.getAllUsersChats(userId)
    }

    @Get("get-chat-members")
    async getChatParticipants(@Headers("X-Chat-Id") chatId: string) {
        return this.chatService.getChatParticipants(chatId)
    }

    @Post("create-chat")
    createChat(@Headers("X-User-Id") userId: string, @Body() dto: CreateChatDto) {
        return this.chatService.createChat(userId, dto)
    }
}