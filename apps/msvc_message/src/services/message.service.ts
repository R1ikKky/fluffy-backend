import { BadRequestException, Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from "../entities/message.entity";
import { Repository } from "typeorm";
import { CreateMessageDto } from "../dto/createMessageDto";
import { ReadMessageDto } from "../dto/readMessageDto";
import { PublishService } from "./publisher.service";
import Redis from "ioredis";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";


@Injectable()
export class MessageService implements OnModuleInit {
      private readonly logger = new Logger(MessageService.name);

    constructor(
        @InjectRepository(MessageEntity) private readonly messagesRepo: Repository<MessageEntity>,
        @Inject("REDIS") private readonly redisClient: Redis,
        @Inject('MSVC_MESSAGE') private rabbitClient: ClientProxy,
        private readonly publisherService: PublishService,
    ) {}

    async onModuleInit() {
        await this.rabbitClient.connect()
        this.logger.log('✅ RabbitMQ client connected to message service')
    }

    async createMessage(userId: string, dto: CreateMessageDto) {
        try {
            const message = await this.messagesRepo.save({
                chatId: dto.chatId,
                senderId: userId,
                text: dto.text,
                attachments: dto.attachments ?? []
            })
            
            const participants = await firstValueFrom(
                this.rabbitClient.send({ cmd: "chat.get.participants" }, { chatId: dto.chatId })
            )  
                //temp check
                if (!participants || typeof participants !== "object" || participants.ok === false) {
                  const reason = participants?.reason || "Invalid response from chat service";
                  this.logger.error(`❌ chat.get.participants failed: ${reason}`);
                  throw new BadRequestException(reason);
                }

    
            await this.publisherService.publish("chat.topic", `chat.${dto.chatId}.new`, {
                message, 
                participants
            })
    
            return message;
        } catch(err) {
            this.logger.error("createMessage failed", err);
            throw err;
        }
        
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