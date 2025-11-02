import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { ChatService } from "../services/chat.service";
import { CreateChatDto } from "../dto/createChat.dto";
import { MemberService } from "../services/members.service";
import { AddMemberDto } from "../dto/addMember.dto";

@Controller("chat")
export class ChatController {
    constructor (
        private readonly chatService: ChatService,
        private readonly memberService: MemberService

    ) {}

    @Get("get-all-users-chats")
    GetAllUsersChats(@Headers("X-User-Id") userId: string) {
        return this.chatService.getAllUsersChats(userId)
    }

    @Post("get-chat-members")
    async getChatParticipants(@Body() chatId: string) {
        return this.chatService.getChatParticipants(chatId)
    }

    @Post("add-member")
    async addMember(@Headers("X-User-Id") userId: string, @Body() dto: AddMemberDto) {
        return this.memberService.addMember(userId, dto.chatId, dto.role)
    }

    @Post("remove-member")
    async removeMember(@Headers("X-User-Id") userId: string, @Body() chatId: string) {
        return this.memberService.removeMember(chatId, userId)
    }

    @Post("create-chat")
    createChat(@Headers("X-User-Id") ownerId: string, @Body() dto: CreateChatDto) {
        return this.chatService.createChat(ownerId, dto)
    }
}