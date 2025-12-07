import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MemberEntity } from "../entities/member.entity";
import { Repository } from "typeorm";
import { PublishService } from "./publisher.service";
import Redis from "ioredis";


@Injectable()
export class MemberService {

    private readonly logger = new Logger(MemberService.name)

    constructor(
        @InjectRepository(MemberEntity) 
        private readonly memberRepo: Repository<MemberEntity>,

        @Inject("REDIS") 
        private readonly redis: Redis,

        private readonly publisher: PublishService,

    ) {}

    private chatMemberKey(chatId: string) {
        return `chat:${chatId}:member`;
    }

    async addMember(userId: string, chatId: string, role: "member" | "admin" = "member") {

        const exists = await this.memberRepo.findOne({ where: { chatId, userId } })
        if (exists) {
            return { ok: true, alreadyMember: true }
        }

        await this.memberRepo.insert({ chatId, userId, role });

        try {
            await this.redis.sadd(this.chatMemberKey(chatId), userId)
        } catch (err) {
            this.logger.error(`❌ Redis SADD failed for chat ${chatId}`, err as any)
        }

        try {
            await this.publisher.publish("chat.topic", `chat.${chatId}.member.added`, { chatId, userId, role })
        } catch(err) {
            this.logger.error(`❌ Failed to publish member.added for chat ${chatId}`, err as any)
        }

        return { ok: true };
    }

    async removeMember(chatId: string, userId: string) {

        const res = await this.memberRepo.delete({ chatId, userId })

        if(!res.affected ||  res.affected === 0) {
            throw new NotFoundException("member not found in this chat");
        }

        try {
            await this.redis.srem(this.chatMemberKey(chatId), userId)
        } catch (err) {
            this.logger.error(`❌ Redis SREM failed for chat ${chatId}`, err as any)
        }

        try {
            await this.publisher.publish("chat.topic", `chat.${chatId}.member.removed`, { chatId, userId });
        } catch (err) {
            this.logger.error(`❌ Failed to publish member.removed for chat ${chatId}`, err as any)
        }
        return { ok: true }
    }
}