import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RefreshEntity } from "../entities/refresh.entity";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { UserEntity } from "../entities/user.entity";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenService {
    private readonly refreshTtlMs: number;
    private readonly accessTtlSec: number;  


    constructor (
        @InjectRepository(RefreshEntity) private readonly refreshRepo: Repository<RefreshEntity>,
        private readonly cfg: ConfigService,
        private readonly jwt: JwtService
    ) {
        this.accessTtlSec = Number(cfg.get("ACCESS_TTL_SEC") ?? 900);
        this.refreshTtlMs = Number(this.cfg.get("REFRESH_TTL_SEC") ?? 2_592_000) * 1000;
    }

    async issueRefresh(userId: string, ip?: string): Promise<RefreshEntity>{
        const now = new Date();
        return this.refreshRepo.save({
            userId,
            issuedAt: now,
            expiresIn: new Date(now.getDate() + this.refreshTtlMs),
            ip,
        });
    }

    async signAccess(user: UserEntity): Promise<string> {
        const payload = { sub: user.id, ver: user.isVerified ? 1 : 0 };
        return this.jwt.signAsync(payload, { expiresIn: this.accessTtlSec })
    }

    
}