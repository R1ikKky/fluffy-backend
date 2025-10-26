import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from "../entities/message.entity";
import { Repository } from "typeorm";
import { CreateMessageDto } from "../dto/createMessageDto";
import { ReadMessageDto } from "../dto/readMessageDto";
import { PublishService } from "./publisher.service";


@Injectable()
export class MessageService{
    constructor(
        @InjectRepository(MessageEntity) private readonly messagesRepo: Repository<MessageEntity>,
        private readonly publisherService: PublishService
    ){}

    async createMessage(userId: string, dto: CreateMessageDto) {
        const msg = await this.messagesRepo.save({
            chatId: dto.chatId,
            senderId: userId,
            text: dto.text,
            attachments: dto.attachments ?? []
        })

        await this.publisherService.publish("chat.topic", `chat.${dto.chatId}.new`, {
            message: msg, 
            participants: await this.publisherService.getParticipants(dto.chatId)
        })

        return msg;
    }

    async getChatMessages(chatId: string, page = 0, limit = 50) {
        return this.messagesRepo.find({
            where: { chatId },
            order: { createdAt: "DESC" },
            skip: page * limit,
            take: limit
        })
    }

    async markRead(userId: string, dto: ReadMessageDto) {
        await this.publisherService.publish("chat.topic", `chat.${dto.chatId}.read`, {
            chatId: dto.chatId,
            messageId: dto.messageId,
            userId
        });
        return { ok: true };
    }
}