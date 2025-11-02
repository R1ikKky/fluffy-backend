import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MemberEntity } from "../entities/member.entity";
import { Repository } from "typeorm";
import { PublishService } from "./publisher.service";


@Injectable()
export class MemberService {
    constructor(
        @InjectRepository(MemberEntity) private readonly memberRepo: Repository<MemberEntity>,
        private readonly publisher: PublishService,
    ) {}

    async addMember(userId: string, chatId: string, role: "member" | "admin") {
        await this.memberRepo.insert({ chatId: chatId, userId: userId, role: role });
        await this.publisher.publish("chat.topic", `chat.${chatId}.member.added`, { chatId, userId })
        return { ok: true };
    }

    async removeMember(chatId: string, userId: string) {
        await this.memberRepo.delete({ chatId, userId });
        await this.publisher.publish("chat.topic", `chat.${chatId}.member.removed`, { chatId, userId });
        return { ok: true }
    }
}