import { Inject, Injectable, HttpException, HttpStatus, ConflictException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { DataSource, IsNull, MoreThan, Repository } from "typeorm";
import { RefreshEntity } from "../entities/refresh.entity";
import { ConfigService } from "@nestjs/config";
import { PasswordService } from "./password.service";
import { Redis } from 'ioredis';
import { RegisterDto } from "../dto/register.dto";
import { TokensDto } from "../dto/tokens.dto";
import { JwtService } from "@nestjs/jwt";
import { AmqpConnectionManager } from "amqp-connection-manager";
import { Channel } from "amqplib";
import { LoginDto } from "../dto/login.dto";
import { TokenService } from "./token.service";
import { RefreshDto } from "../dto/refresh.dto";


@Injectable()
export class AuthService {

    private readonly AccessTtlSec: number;  
    private readonly RefreshTtlMs: number;

    private normalizeEmail(email: string): string {
        return email.trim().toLowerCase();
    }

    private  async enforceRate(key: string, limit: number, windowsMs: number): Promise<void>{
        const cnt = await this.redis.incr(key)
        if(cnt === 1) await this.redis.pexpire(key, windowsMs)
        if(cnt > limit) throw new HttpException("rate limit", HttpStatus.TOO_MANY_REQUESTS)
    }

    private async signAccess(user: UserEntity): Promise<string> {
        const payload = { sub: user.id, ver: user.isVerified ? 1 : 0 };
        return this.jwt.signAsync(payload)
    }

    private publish(exchange: string, routingKey: string, payload: unknown) {
        try {
            if (!this.amqp) return;
            const ch = this.amqp.createChannel();
            ch.addSetup(async (raw: Channel) => {
                await raw.assertExchange(exchange, "topic", { durable: true })
                raw.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
                    contentType: "application/json",
                    persistent: true
                });
            });
        } catch {}
    }

    constructor (
        @InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>,
        @InjectRepository(RefreshEntity) private readonly refreshRepo: Repository<RefreshEntity>,
        private readonly ds: DataSource,
        private readonly cfg: ConfigService,
        private readonly jwt: JwtService,
        private readonly PasswordService: PasswordService,
        private readonly TokenService: TokenService,
        @Inject("REDIS") private readonly redis: Redis,
        @Inject('AMQP') private readonly amqp: AmqpConnectionManager | null, 
    ) {
        this.AccessTtlSec = Number(cfg.get("ACCESS_TTL_SEC") ?? 900);
        this.RefreshTtlMs = Number(cfg.get("REFRESH_TTL_SEC") ?? 2_592_000) * 1000;
    }

    //---//

    async register (dto: RegisterDto, ip?: string, ua?: string): Promise<TokensDto> {
        const email = this.normalizeEmail(dto.email);

        await this.enforceRate(`register:ip:${ ip ?? "na" }`, 8, 30_000);
        await this.enforceRate(`register:ip:${ email }`, 6, 60_000);

        const exists = await this.usersRepo.findOne({ where: { email } });
        if (exists) throw new ConflictException("email already registered");

        const passHash = await this.PasswordService.hash(dto.password);

        const now = new Date();

        let user!: UserEntity
        let refresh!: RefreshEntity

        await this.ds.transaction(async (em) => {
            user = await em.getRepository(UserEntity).save({ email, passHash })
            refresh = await em.getRepository(RefreshEntity).save({
                user,
                issuedAt: now,
                expiresAt: new Date(now.getTime() + this.RefreshTtlMs),
                ip,
                userAgent: ua,
                user_id: user.id
            })
        })

        this.publish("auth.topic", "user.registered", { userId: user.id, email }); 

        const access = await this.signAccess(user)
        return { access, refresh: refresh.token, ttl: this.AccessTtlSec }
    }


    async login(dto: LoginDto, ip?: string, ua?: string): Promise<TokensDto>{
        const email = this.normalizeEmail(dto.email);

        await this.enforceRate(`login:ip:${ ip ?? "na" }`, 10, 30_000);
        await this.enforceRate(`login:ip:${ email }`, 8, 60_000);

        const user = await this.usersRepo.findOne({ where: { email } })
        if (!user) throw new UnauthorizedException("invalid credentials(no email in db found)")
        
        const ok = await this.PasswordService.verify(dto.password, user.passHash)
        if(!ok) throw new UnauthorizedException("invalid credentials(password doesn't match)")

        if (this.PasswordService.needsRehash(user.passHash)){
            const newHash = await this.PasswordService.hash(dto.password)
            await this.usersRepo.update(user.id, { passHash: newHash })
        }

        const refreshToken = await this.TokenService.issueRefresh(user.id, ip, ua)
        const accessToken = await this.TokenService.signAccess(user)
        return { access: accessToken, refresh: refreshToken.token, ttl: this.AccessTtlSec }
    }

    async refteshTokens(dto: RefreshDto, ip?: string, ua?: string): Promise<TokensDto> {
        const now = new Date();

        const current = await this.refreshRepo.findOne({
            where: {
                token: dto.refresh,
                revokedAt: IsNull(),
                expiresAt: MoreThan(now),
            },
        });

        if(!current) throw new UnauthorizedException("invalid refresh token");
        
        const user = await this.usersRepo.findOne({ where: { id: current.user.id } })
        if(!user) throw new UnauthorizedException("invalid refresh token")

        let newRefresh!: RefreshEntity

        await this.ds.transaction(async (em) => {
            await em.getRepository(RefreshEntity).update({ token: current.token }, { revokedAt: now })

            newRefresh = await em.getRepository(RefreshEntity).save({
                user,
                issuedAt: now,
                expiresAt: new Date(now.getTime() + this.RefreshTtlMs),
                ip,
                userAgent: ua
            });
        });

        const access = await this.TokenService.signAccess(user);
        return { access, refresh: newRefresh.token, ttl: this.AccessTtlSec }
        
    }

    async logout(dto: RefreshDto): Promise<{ ok: true }> {
        await this.refreshRepo.update({ token: dto.refresh }, { revokedAt: new Date() });
        return { ok: true };
    }
}