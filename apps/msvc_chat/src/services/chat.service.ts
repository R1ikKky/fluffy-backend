import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ChatEntity } from "../entities/chat.entity";
import { MemberEntity } from "../entities/member.entity";
import { CreateChatDto } from "../dto/createChat.dto";
import { Repository } from "typeorm";
import { PublishService } from "./publisher.service";

@Injectable()
export class ChatService{
    constructor(
        @InjectRepository(ChatEntity) private readonly chatRepo: Repository<ChatEntity>,
        @InjectRepository(MemberEntity) private readonly memberRepo: Repository<MemberEntity>,
        private readonly publisher: PublishService,
    ) {}

    async createChat(ownerId: string, dto: CreateChatDto) {
        const chat = await this.chatRepo.save({
            type: dto.type,
            title: dto.title ?? "new chat",
            avatarUrl: dto.avatarUrl ?? null,
            ownerId
        })

        const participants = new Set([ownerId, ...dto.participants]);
        await this.memberRepo.insert(
            Array.from(participants).map((id) => ({
                chatId: chat.id,
                userId: id,
                role: id === ownerId ? "owner" : "member"
            }))
        )

        // await this.publisher.publish("chat.topic", `chat.${chat.id}.created`, {
        //     chatId: chat.id,
        //     participants: Array.from(participants)
        // })

        return chat;
    }

    async getAllUsersChats(userId: string) {
        const members = await this.memberRepo.find({ where: { userId }, relations: ["chat"] });
        return members.map((member) => member.chat);
    }

    async getChatParticipants(chatId: string) {
        return this.memberRepo.find({ where: { chatId } });
    }
}