import { ConflictException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { In, Repository } from "typeorm";
import { UpdateUserDto } from "../dto/updateUserDto";
import { AccountDto } from "../dto/accountDto";
import Redis from "ioredis";

@Injectable()
export class UserService {

    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>,
        @Inject("REDIS") private readonly redisClient: Redis

    ) {};
    
    async getOneByAccountId(accountId: string): Promise<UserEntity | null> {   // находит не по айдишнику юзера а по account ID БлЯтЬ
        const userInRedis = await this.redisClient.get(`accountId:${accountId}`);
        if (userInRedis) return JSON.parse(userInRedis);
        const user = await this.usersRepo.findOne({ where: { accountId: accountId } }); 
        if (!user) throw new NotFoundException("user not found");
        await this.redisClient.set(`accountId:${accountId}`, JSON.stringify(user))
        return user;
    }
    
    async getManyByIds(ids: string[]){
        if (!ids.length) return [];
        const unique = [...new Set(ids)];
        return this.usersRepo.find({ where: {accountId: In(unique)} });
    }
    
    async getAll(): Promise<UserEntity[]>{
        return this.usersRepo.find()
    }
    
    async updateOne(accountId: string, patch: UpdateUserDto) {
        const user = await this.usersRepo.findOne({ where: { accountId } })
        if (!user) throw new NotFoundException("user not found")
            
            const toSave: Partial<UserEntity> = { accountId };
            
            if (patch.username !== undefined) {
                const user = (patch.username || "").trim();
                toSave.username = user ? user.toLowerCase() : null;
                if(toSave.username) {
                    const exists = await this.usersRepo.findOne({ where: { username: toSave.username} });
                    if(exists && exists.accountId !== accountId) throw new ConflictException("username taken");
                }
            }
            
            if (patch.firstName !== undefined) {
                toSave.firstName = patch.firstName;
            }
            
            if (patch.secondName !== undefined) {
                toSave.secondName = patch.secondName;
            }
            
            if (patch.avatarUrl !== undefined) {
                const url = patch.avatarUrl?.trim();
                toSave.avatarUrl = url || null;
            }
            
            if (patch.bio !== undefined) {
                toSave.bio = patch.bio;
            }
            
            await this.usersRepo.update({ accountId }, toSave);

            const updatedUser = await this.usersRepo.findOne({ where: { accountId } });
            
            if (updatedUser) {
                await this.redisClient.set(`accountId:${accountId}`, JSON.stringify(updatedUser))
            } else {
                await this.redisClient.del(`accountId:${accountId}`)
            }
            
        }
        
        async createUser(account: AccountDto) {
            const exists = await this.usersRepo.findOne({ where: { accountId: account.accountId } });
            if (exists){
                this.logger.warn(`Duplicate account creation ignored: ${account.email}`);
                return;
            }
            
            this.logger.log(`✅ recieved user: ${account.accountId}, ${account.email}`);
            
            return this.usersRepo.save({
                accountId: account.accountId,
                email: account.email,
                avatarUrl: null,
            }) 
        }

        async deleteUser(accountId: string){
            try{
                this.logger.log(`✅ recieved user to delete: ${accountId}`);
                const user = await this.usersRepo.findOne({ where: { accountId: accountId } });
                if(!user) return { ok: false, reason: "User not found" }

                const res = await this.usersRepo.delete({ accountId: accountId });
                if(!res.affected) return { ok: false, reason: "User not found2" };
                await this.redisClient.del(`accountId:${accountId}`)
                return { ok: true };
            } catch(err) {
                return { ok: false, reason: err };
            }
        }

        async handleUserValidation(accountIds: string[]) {
            try {
                const users  = await this.usersRepo.find({
                    where: {
                        accountId: In(accountIds)
                    },
                    select: ["accountId"]
                })
                
                const foundIds = users.map(user => user.accountId)
                const missingIds = accountIds.filter(id => !foundIds.includes(id))

                return {
                    foundIds,
                    missingIds
                }
            } catch (err) {
                throw err
            }
        }
    }


    // async updatePassword(userId: string, newHash: string): Promise<void> {
        //     await this.usersRepo.update({ id: userId }, { passHash: newHash });
        // }

    // async findByEmail(id: string): Promise<UserEntity | null> {
    //     return this.usersRepo.findOne({ where: { email: normalized } });
    // }
        
    // async markVerified(userId: string): Promise<void> {
        //     await this.usersRepo.update({ id: userId }, { isVerified: true });
        // }
