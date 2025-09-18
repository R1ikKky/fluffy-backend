import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>,
    ) {}

    // async findByEmail(email: string): Promise<UserEntity | null> {
    //     const normalized = email.trim();
    //     return this.usersRepo.findOne({ where: { email: normalized } });
    // }

    async findById(id: string): Promise<UserEntity | null> {
        return this.usersRepo.findOne({ where: { id } })
    }

    // async create(email: string, passHash: string): Promise<UserEntity> {
    //     const normalized = email.trim();
        
    //     const isEmailExists = await this.findByEmail(email)

    //     if(isEmailExists) {
    //         throw new BadRequestException("This email is already tacken")
    //     }

    //     const user = this.usersRepo.create({
    //         email: normalized,
    //         passHash,
    //         isVerified: false,
    //     });
    //     return await this.usersRepo.save(user);
       
    // }
    
    // async updatePassword(userId: string, newHash: string): Promise<void> {
    //     await this.usersRepo.update({ id: userId }, { passHash: newHash });
    // }

    // async markVerified(userId: string): Promise<void> {
    //     await this.usersRepo.update({ id: userId }, { isVerified: true });
    // }

    async delete(userId: string): Promise<void> {
        await this.usersRepo.delete({ id: userId });
    }
}