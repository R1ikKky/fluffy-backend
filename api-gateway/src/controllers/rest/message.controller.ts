import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../../guards/jwt.guard";
import { MessageApiService } from "../../services/message-api.service";
import { CreateMessageDto } from "../../dto/createMessageDto";
import { GetChatMessagesDto } from "../../dto/getChatMessagesDto";
import { ReadMessageDto } from "../../dto/readMessageDto";

@UseGuards(JwtGuard)
@Controller("messages")
export class MessageController {
    constructor(private readonly messageApiService: MessageApiService) {}

    @Post("create-one")
    createOne(@Req() req: any, @Body() body: CreateMessageDto){
        const userId = req.user.id;
        return this.messageApiService.createOne(userId, body)
    }

    @Post("get-chat-messages")
    getChatMessages(@Req() req: any, @Body() body: GetChatMessagesDto){
        const userId = req.user.id;
        return this.messageApiService.getChatMessages(userId, body)
    }

    @Post("mark-read")
    markRead(@Req() req: any, @Body() body: ReadMessageDto){
        const userId = req.user.id;
        return this.messageApiService.markRead(userId, body)
    }
}
