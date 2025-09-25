import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { In, Repository } from "typeorm";
import { UpdateUserDto } from "../dto/updateUserDto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>,
    ) {}

    
    async getOneById(id: string): Promise<UserEntity | null> {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user) throw new NotFoundException("user not found");
        return user;
    }
    
    async getManyByIds(ids: string[]){
        if (!ids.length) return [];
        const unique = [...new Set(ids)];
        return this.usersRepo.find({ where: {id: In(unique)} });
    }
    
    async getAll(): Promise<UserEntity[]>{
        return this.usersRepo.find()
    }
    
    
    
    async updateOne(userId: string, patch: UpdateUserDto) {
        const user = await this.usersRepo.findOne({ where: { id: userId } })
        if (!user) throw new NotFoundException("user not found")
            
            const toSave: Partial<UserEntity> = { id: userId };
            
            if (patch.username !== undefined) {
                const user = (patch.username || "").trim();
                toSave.username = user ? user.toLowerCase() : null;
                if(toSave.username) {
                    const exists = await this.usersRepo.findOne({ where: { username: toSave.username} });
                    if(exists && exists.id !== userId) throw new ConflictException("username taken");
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
            
            await this.usersRepo.save(toSave);
            return this.usersRepo.findOne({ where: { id: userId } });
            
        }
        
        
        async delete(userId: string): Promise<void> {
            const user = await this.usersRepo.findOne({ where: { id: userId } })
            if(!user) throw new BadRequestException("no user exist")
                await this.usersRepo.delete({ id: userId });
        }
    }
    // async updatePassword(userId: string, newHash: string): Promise<void> {
        //     await this.usersRepo.update({ id: userId }, { passHash: newHash });
        // }
    // async findByEmail(email: string): Promise<UserEntity | null> {
    //     const normalized = email.trim();
    //     return this.usersRepo.findOne({ where: { email: normalized } });
    // }
        
    // async markVerified(userId: string): Promise<void> {
        //     await this.usersRepo.update({ id: userId }, { isVerified: true });
        // }
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