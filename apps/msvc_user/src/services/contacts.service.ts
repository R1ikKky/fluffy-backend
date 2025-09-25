import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { In, Repository } from "typeorm";
import { ContactEntity } from "../entities/contact.entity";


@Injectable()
export class ContactsService {
    constructor(
        @InjectRepository(ContactEntity) private readonly contactRepo: Repository<ContactEntity>,
        @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>
    ) {}

    async list(ownerId: string){
        const rows = await this.contactRepo.find({ where: { ownerId } });
        const ids = rows.map(row => row.peerId);
        if (!ids.length) return [];
        const users = await this.userRepo.find({ where: { id: In(ids) } });
        return {ids, users};
    }

    async add(ownerId: string, peerId: string) {
        if (ownerId === peerId) throw new ForbiddenException("mostturbation not allowed");
        const ContactAlreadyExists = await this.contactRepo.findOne({ where: { ownerId, peerId } });
        if(ContactAlreadyExists) return {"Contact already exists" : ContactAlreadyExists};
        const [owner, peer] = await Promise.all([
            this.userRepo.findOne({ where: { id: ownerId } }),
            this.userRepo.findOne({ where: { id: peerId } })
        ]);
        if (!owner || !peer) throw new NotFoundException('user not found (may not even exist)');
        
        return this.contactRepo.save({ownerId, peerId});
    }

    async remove(ownerId: string, peerId: string){
        const responce = await this.contactRepo.delete({ ownerId, peerId });
        if (!responce.affected) throw new NotFoundException("user not found (may not even exist)");
    }
}