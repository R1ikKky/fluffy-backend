import { Inject, Injectable, HttpException, HttpStatus, ConflictException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountEntity } from "../entities/account.entity";
import { DataSource, IsNull, MoreThan, Repository } from "typeorm";
import { RefreshEntity } from "../entities/refresh.entity";
import { ConfigService } from "@nestjs/config";
import { PasswordService } from "./password.service";
import { Redis } from 'ioredis';
import { RegisterDto } from "../dto/register.dto";
import { TokensDto } from "../dto/tokens.dto";
import type { AmqpConnectionManager } from "amqp-connection-manager";
import { LoginDto } from "../dto/login.dto";
import { TokenService } from "./token.service";
import { RefreshDto } from "../dto/refresh.dto";
import { EventPublisher } from "../rabbit/publisher";
import { AUTH_EXCHANGE, RK_ACCOUNT_CREATED } from "../contracts/auth.events";


@Injectable()
export class AuthService {
    private publisher!: EventPublisher;

    private readonly RefreshTtlMs: number;

    private normalizeEmail(email: string): string {
        return email.trim().toLowerCase();
    }

    private  async enforceRate(key: string, limit: number, windowsMs: number): Promise<void>{
        const cnt = await this.redis.incr(key)
        if(cnt === 1) await this.redis.pexpire(key, windowsMs)
        if(cnt > limit) throw new HttpException("rate limit", HttpStatus.TOO_MANY_REQUESTS)
    }

    // private publish(exchange: string, routingKey: string, payload: unknown) {
    //     try {
    //         if (!this.amqp) return;
    //         const ch = this.amqp.createChannel();
    //         ch.addSetup(async (raw: Channel) => {
    //             await raw.assertExchange(exchange, "topic", { durable: true })
    //             raw.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
    //                 contentType: "application/json",
    //                 persistent: true
    //             });
    //         });
    //     } catch {}
    // }

    constructor (
        @InjectRepository(AccountEntity) private readonly accountsRepo: Repository<AccountEntity>,
        @InjectRepository(RefreshEntity) private readonly refreshRepo: Repository<RefreshEntity>,
        private readonly ds: DataSource,
        private readonly cfg: ConfigService,
        private readonly PasswordService: PasswordService,
        private readonly TokenService: TokenService,
        @Inject("REDIS") private readonly redis: Redis,
        @Inject("AMQP") amqp: AmqpConnectionManager, 
    ) {
        this.RefreshTtlMs = Number(cfg.get("REFRESH_TTL_SEC") ?? 2_592_000) * 1000;
        this.publisher = new EventPublisher(amqp, AUTH_EXCHANGE);
    }

    //---//

    async register (dto: RegisterDto, ip?: string, ua?: string): Promise<TokensDto> {
        const email = this.normalizeEmail(dto.email);

        await this.enforceRate(`register:ip:${ ip ?? "na" }`, 8, 30_000);
        await this.enforceRate(`register:ip:${ email }`, 6, 60_000);

        const exists = await this.accountsRepo.findOne({ where: { email } });
        if (exists) throw new ConflictException("email already registered");

        const passHash = await this.PasswordService.hash(dto.password);

        const now = new Date();

        let account!: AccountEntity
        let refresh!: RefreshEntity

        await this.ds.transaction(async (em) => {
            account = await em.getRepository(AccountEntity).save({ email, passHash })
            refresh = await em.getRepository(RefreshEntity).save({
                account,
                issuedAt: now,
                expiresAt: new Date(now.getTime() + this.RefreshTtlMs),
                ip,
                accountAgent: ua,
                account_id: account.id
            })
        })

        // this.publish("auth.topic", "account.registered", { accountId: account.id, email }); 
        await this.publisher.publish(RK_ACCOUNT_CREATED, {
            accountId: account.id,
            email: account.email,
            ts: new Date().toString()
        })


        const accessToken = await this.TokenService.signAccess(account)
        return { access: accessToken, refresh: refresh.token}
    }


    async login(dto: LoginDto, ip?: string, ua?: string): Promise<TokensDto>{
        const email = this.normalizeEmail(dto.email);

        await this.enforceRate(`login:ip:${ ip ?? "na" }`, 10, 30_000);
        await this.enforceRate(`login:ip:${ email }`, 8, 60_000);

        const account = await this.accountsRepo.findOne({ where: { email } })
        if (!account) throw new UnauthorizedException("invalid credentials(no email in db found)")
        
        const ok = await this.PasswordService.verify(dto.password, account.passHash)
        if(!ok) throw new UnauthorizedException("invalid credentials(password doesn't match)")

        if (this.PasswordService.needsRehash(account.passHash)){
            const newHash = await this.PasswordService.hash(dto.password)
            await this.accountsRepo.update(account.id, { passHash: newHash })
        }

        const refreshToken = await this.TokenService.issueRefresh(account.id, ip, ua)
        const accessToken = await this.TokenService.signAccess(account)
        return { access: accessToken, refresh: refreshToken.token }
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
        
        const account = await this.accountsRepo.findOne({ where: { id: current.account.id } })
        if(!account) throw new UnauthorizedException("invalid refresh token")

        let newRefresh!: RefreshEntity

        await this.ds.transaction(async (em) => {
            await em.getRepository(RefreshEntity).update({ token: current.token }, { revokedAt: now })

            newRefresh = await em.getRepository(RefreshEntity).save({
                account,
                issuedAt: now,
                expiresAt: new Date(now.getTime() + this.RefreshTtlMs),
                ip,
                accountAgent: ua
            });
        });

        const accessToken = await this.TokenService.signAccess(account);
        return { access: accessToken, refresh: newRefresh.token }
        
    }

    async logout(dto: RefreshDto): Promise<{ ok: true }> {
        await this.refreshRepo.delete({ token: dto.refresh });
        return { ok: true };
    }
}