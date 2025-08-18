import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RefreshEntity } from "../entities/refresh.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { UserEntity } from "../entities/user.entity";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenService {
    constructor (
        @InjectRepository(RefreshEntity) private readonly refreshRepo: Repository<RefreshEntity>,
        private readonly cfg: ConfigService,
        private readonly jwt: JwtService
    ) {}

    async issueRefresh(userId: string, ip?: string): Promise<RefreshEntity>{
        const now = new Date();
        const ttlMs = this.cfg.get('REFRESH_TTL_MS') ?? '2592000000';
        const row = await this.refreshRepo.save({
            userId,
            issuedAt: now,
            expiresIn: new Date(now.getDate() + ttlMs),
            ip,
        });
        return row
    }

    async signAccess(user: UserEntity): Promise<string> {
        const payload = { sub: user.id, ver: user.isVerified ? 1 : 0 };
        return this.jwt.signAsync(payload)
    }

    
}