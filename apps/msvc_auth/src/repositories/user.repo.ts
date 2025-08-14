import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { Repository } from "typeorm";

export class EmailTakenError extends Error {
    constructor(message = "email is already taken") {
        super(message);
        this.name = "EmailTakenError"
    }

}

@Injectable()
export class UserRepo {
    constructor(
        @InjectRepository(UserEntity)
        private readonly users: Repository<UserEntity>,
    ) {}

    async findByEmail(email: string): Promise<UserEntity | null> {
        const normalized = email.trim();
        return this.users.findOne({ where: { email: normalized } });
    }

    async findById(id: string): Promise<UserEntity | null> {
        return this.users.findOne({ where: { id } })
    }

    async create(email: string, passHash: string): Promise<UserEntity> {
        const normalized = email.trim();
        const user = this.users.create({
            email: normalized,
            passHash,
            isVerified: false,
        });

        try {
            return await this.users.save(user);
        } catch (e: any){
            if (e?.code === "23505") {
                throw new EmailTakenError();
            }
            throw e;
        }
    }
    
    async updatePassword(userId: string, newHash: string): Promise<void> {
        await this.users.update({ id: userId }, { passHash: newHash });
    }

    async markVerified(userId: string): Promise<void> {
        await this.users.update({ id: userId }, { isVerified: true });
    }

    async delete(userId: string): Promise<void> {
        await this.users.delete({ id: userId });
    }

    async existsByEmail(email: string): Promise<boolean> {
        const normalized = email.trim();
        const { count } = (await this.users
            .createQueryBuilder("u")
            .select("COUNT(1)", "count")
            .where("u.email = :email", { email: normalized })
            .getRawOne<{ count: string }>())!;
        
        return Number(count) > 0;
    }
}