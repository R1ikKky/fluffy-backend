import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common"
import { JwtGuard } from "../../guards/jwt.guard"
import { AddMemberDto } from "../../dto/addMember.dto"
import { CreateChatDto } from "../../dto/createChat.dto"
import { ChatApiService } from "../../services/chat-api.service"

@UseGuards(JwtGuard)
@Controller("chat")
export class ChatController {
    constructor(private readonly chatApiService: ChatApiService) {}

    @Get("get-all-users-chats")
    GetAllUsersChats(@Req() req: any) {
        const userId =  req.user.id
        return this.chatApiService.getAllUsersChats(userId)
    }

    @Post("get-chat-members")
    async getChatParticipants(@Body() chatId: string) {
        return this.chatApiService.getChatParticipants(chatId)
    }

    @Post("add-member")
    async addMember(@Req() req: any, @Body() dto: AddMemberDto) {
        const userId =  req.user.id
        return this.chatApiService.addMember(userId, dto.chatId, dto.role)
    }

    @Post("remove-member")
    async removeMember(@Req() req: any, @Body() chatId: string) {
        const userId =  req.user.id
        return this.chatApiService.removeMember(chatId, userId)
    }

    @Post("create-chat")
    createChat(@Req() req: any, @Body() dto: CreateChatDto) {
        const ownerId =  req.user.id
        return this.chatApiService.createChat(ownerId, dto)
    }

}
