import {
  Inject,
  Injectable,
  HttpException,
  HttpStatus,
  ConflictException,
  UnauthorizedException,
  Logger,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from '../entities/account.entity';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';
import { RefreshEntity } from '../entities/refresh.entity';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from './password.service';
import { Redis } from 'ioredis';
import { RegisterDto } from '../dto/register.dto';
import { TokensDto } from '../dto/tokens.dto';
import { LoginDto } from '../dto/login.dto';
import { TokenService } from './token.service';
import { RefreshDto } from '../dto/refresh.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private readonly RefreshTtlMs: number;

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async enforceRate(
    key: string,
    limit: number,
    windowsMs: number
  ): Promise<void> {
    const cnt = await this.redis.incr(key);
    if (cnt === 1) await this.redis.pexpire(key, windowsMs);
    if (cnt > limit)
      throw new HttpException('rate limit', HttpStatus.TOO_MANY_REQUESTS);
  }

  constructor(
    @Inject('MSVC_AUTH') private rabbitClient: ClientProxy,
    @InjectRepository(AccountEntity)
    private readonly accountsRepo: Repository<AccountEntity>,
    @InjectRepository(RefreshEntity)
    private readonly refreshRepo: Repository<RefreshEntity>,
    private readonly ds: DataSource,
    private readonly cfg: ConfigService,
    private readonly PasswordService: PasswordService,
    private readonly TokenService: TokenService,
    @Inject('REDIS') private readonly redis: Redis
  ) {
    this.RefreshTtlMs = Number(cfg.get('REFRESH_TTL_SEC') ?? 2_592_000) * 1000;
  }

  async onModuleInit() {
    await this.rabbitClient.connect();
    this.logger.log('✅ RabbitMQ client connected');
  }

  //---//

  async register(
    dto: RegisterDto,
    ip?: string,
    ua?: string
  ): Promise<TokensDto> {
    const email = this.normalizeEmail(dto.email);

    await this.enforceRate(`register:ip:${ip ?? 'na'}`, 8, 30_000);
    await this.enforceRate(`register:ip:${email}`, 6, 60_000);

    const exists = await this.accountsRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('email already registered');

    const passHash = await this.PasswordService.hash(dto.password);

    const now = new Date();

    let account!: AccountEntity;
    let refresh!: RefreshEntity;

    await this.ds.transaction(async (em) => {
      account = await em.getRepository(AccountEntity).save({ email, passHash });
      refresh = await em.getRepository(RefreshEntity).save({
        account,
        issuedAt: now,
        expiresAt: new Date(now.getTime() + this.RefreshTtlMs),
        ip,
        accountAgent: ua,
        account_id: account.id,
      });

      this.rabbitClient.emit('account.registered', {
        accountId: account.id,
        email,
      });
      this.logger.log('✅ emit call executed');
    });

    const accessToken = await this.TokenService.signAccess(account);
    return { access: accessToken, refresh: refresh.token };
  }

  async login(dto: LoginDto, ip?: string, ua?: string): Promise<TokensDto> {
    const email = this.normalizeEmail(dto.email);

    await this.enforceRate(`login:ip:${ip ?? 'na'}`, 10, 30_000);
    await this.enforceRate(`login:ip:${email}`, 8, 60_000);

    const account = await this.accountsRepo.findOne({ where: { email } });
    if (!account)
      throw new UnauthorizedException(
        'invalid credentials(no email in db found)'
      );

    const ok = await this.PasswordService.verify(
      dto.password,
      account.passHash
    );
    if (!ok)
      throw new UnauthorizedException(
        "invalid credentials(password doesn't match)"
      );

    if (this.PasswordService.needsRehash(account.passHash)) {
      const newHash = await this.PasswordService.hash(dto.password);
      await this.accountsRepo.update(account.id, { passHash: newHash });
    }

    const refreshToken = await this.TokenService.issueRefresh(account, ip, ua);
    const accessToken = await this.TokenService.signAccess(account);
    return { access: accessToken, refresh: refreshToken.token };
  }

  
  async refteshTokens(
    dto: RefreshDto,
    ip?: string,
    ua?: string
  ): Promise<TokensDto> {
    const now = new Date();

    const current = await this.refreshRepo.findOne({
      where: {
        token: dto.refresh,
        revokedAt: IsNull(),
        expiresAt: MoreThan(now),
      },
    });

    if (!current) throw new UnauthorizedException('invalid refresh token');

    const account = await this.accountsRepo.findOne({
      where: { id: current.accountId },
    });
    if (!account) throw new UnauthorizedException('invalid refresh token');

    let newRefresh!: RefreshEntity;

    await this.ds.transaction(async (em) => {
      await em
        .getRepository(RefreshEntity)
        .update({ token: current.token }, { revokedAt: now });

      newRefresh = await em.getRepository(RefreshEntity).save({
        account,
        issuedAt: now,
        expiresAt: new Date(now.getTime() + this.RefreshTtlMs),
        ip,
        accountAgent: ua,
      });
    });

    const accessToken = await this.TokenService.signAccess(account);
    return { access: accessToken, refresh: newRefresh.token };
  }

  async deleteAccount(accountId: string) {
    const res = await firstValueFrom(
      this.rabbitClient.send({ cmd: 'account.deleted' }, { accountId })
    );
    if (!res.ok) {
      this.logger.error(`❌ Failed to delete user: ${res.reason}`);
      throw new BadRequestException(res.reason);
    }

    this.logger.log('✅ User deletion confirmed by msvc_user');

    const acc = await this.accountsRepo.findOne({ where: { id: accountId } });
    if (!acc) throw new BadRequestException('no account exist');
    await this.accountsRepo.delete({ id: accountId });
  }

  async logout(dto: RefreshDto): Promise<{ ok: true }> {
    await this.refreshRepo.delete({ token: dto.refresh });
    return { ok: true };
  }
}
