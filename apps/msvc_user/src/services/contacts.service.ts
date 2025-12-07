import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { In, Repository } from "typeorm";
import { ContactEntity } from "../entities/contact.entity";
import Redis from "ioredis";


@Injectable()
export class ContactsService {
    constructor(
        @InjectRepository(ContactEntity) private readonly contactRepo: Repository<ContactEntity>,
        @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
        @Inject("REDIS") private readonly redisClient: Redis
    ) {}

    async list(ownerId: string) {
        const cachedOwnerId = `ownerId:${ownerId}`;

        const cached = await this.redisClient.get(cachedOwnerId);
        if (cached) return JSON.parse(cached);

        const rows = await this.contactRepo.find({ where: { ownerId } });
        const ids = rows.map(row => row.peerId);
        if (!ids.length) {
            await this.redisClient.set(cachedOwnerId, JSON.stringify([]));
            return [];
        }

        const users = await this.userRepo.find({ where: { accountId: In(ids) } });

        const result = { ids, users };

        await this.redisClient.set(cachedOwnerId, JSON.stringify(result))

        return result;
    }

    async add(ownerId: string, peerId: string) {
        if (ownerId === peerId) throw new ForbiddenException("I'm sorry that you're so lonely, but u can't do that, bro");

        const contactAlreadyExists = await this.contactRepo.findOne({ where: { ownerId, peerId } });
        if (contactAlreadyExists) return { "Contact already exists" : contactAlreadyExists };

        const [owner, peer] = await Promise.all([
            this.userRepo.findOne({ where: { accountId: ownerId } }),
            this.userRepo.findOne({ where: { accountId: peerId } })
        ]);

        if (!owner || !peer) throw new NotFoundException('user not found (may not even exist)');
        
        const contact = await this.contactRepo.save({ownerId, peerId});

        await this.redisClient.del(`contacts:${ownerId}`);

        return contact;
    }

    async remove(ownerId: string, peerId: string){
        const responce = await this.contactRepo.delete({ ownerId, peerId });
        if (!responce.affected) throw new NotFoundException("user not found (may not even exist)");
        await this.redisClient.del(`contacts:${ownerId}`)
    }
}