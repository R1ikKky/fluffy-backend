import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { In, Repository } from "typeorm";
import { UpdateUserDto } from "../dto/updateUserDto";
import { AccountDto } from "../dto/accountDto";

@Injectable()
export class UserService {

    private readonly logger = new Logger(UserService.name);


    constructor(
        @InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>,
    ) {}

    
    async getOneByAccountId(id: string): Promise<UserEntity | null> {   // находит не по айдишнику юзера а по account ID БлЯтЬ
        const user = await this.usersRepo.findOne({ where: { accountId: id } }); 
        if (!user) throw new NotFoundException("user not found");
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
        const user = await this.usersRepo.findOne({ where: { accountId } }) // да я еблан не судите строго
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
            return this.usersRepo.findOne({ where: { accountId } });
            
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
                return { ok: true };
            } catch(err) {
                return { ok: false, reason: err };
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
