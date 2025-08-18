import { Inject, Injectable, HttpException, HttpStatus, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { DataSource, Repository } from "typeorm";
import { RefreshEntity } from "../entities/refresh.entity";
import { ConfigService } from "@nestjs/config";
import { PasswordService } from "./password.service";
import { Redis } from 'ioredis';
import { RegisterDto } from "../dto/register.dto";
import { TokensDto } from "../dto/tokens.dto";
import { JwtService } from "@nestjs/jwt";
import { AmqpConnectionManager } from "amqp-connection-manager";
import { Channel } from "amqplib";


@Injectable()
export class AuthService {

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
        } catch {

        }
    }

    constructor (
        @InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>,
        private readonly ds: DataSource,
        private readonly cfg: ConfigService,
        private readonly jwt: JwtService,
        private readonly PasswordService: PasswordService,
        @Inject("REDIS") private readonly redis: Redis,
        @Inject('AMQP') private readonly amqp: AmqpConnectionManager | null, 
    ) {}

    async register (dto: RegisterDto, ip?: string): Promise<TokensDto> {
        const email = this.normalizeEmail(dto.email);

        await this.enforceRate(`login:ip:${ ip ?? "na" }`, 10, 30_000);
        await this.enforceRate(`login:ip:${ email }`, 8, 60_000);

        const exists = await this.usersRepo.findOne({ where: { email } });
        if (exists) throw new ConflictException("email already registered");

        const passHash = await this.PasswordService.hash(dto.password);

        const refreshTTL = Number(this.cfg.get('REFRESH_TTL_MS') ?? 2592000000);
        const now = new Date();

        let user!: UserEntity
        let refresh!: RefreshEntity

        await this.ds.transaction(async (em) => {
            user = await em.getRepository(UserEntity).save({ email, passHash })
            refresh = await em.getRepository(RefreshEntity).save({
                userId: user.id,
                issuedAt: now,
                expiresIn: new Date(now.getTime() + refreshTTL),
                ip
            })
        })

        this.publish("auth.topic", "user.registered", { userId: user.id, email }); 

        const access = await this.signAccess(user)
        return { access, refresh: refresh.token, ttl: String(this.cfg.get("ACCESS_TTL_MS") ?? 900) }
    }
}