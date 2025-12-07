import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatEntity } from '../entities/chat.entity';
import { MemberEntity } from '../entities/member.entity';
import { CreateChatDto } from '../dto/createChat.dto';
import { DataSource, Repository } from 'typeorm';
import Redis from 'ioredis';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { HandleValidationDto } from '../dto/handleValidation.dto';

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @Inject('MSVC_CHAT') private rabbitClient: ClientProxy,

    @InjectRepository(ChatEntity)
    private readonly chatRepo: Repository<ChatEntity>,
    @InjectRepository(MemberEntity)
    private readonly memberRepo: Repository<MemberEntity>,
    @Inject('REDIS') private readonly redisClient: Redis,
    // private readonly publisher: PublishService,
    private readonly dataSource: DataSource
  ) {}

  async onModuleInit() {
    await this.rabbitClient.connect();
    this.logger.log('✅ RabbitMQ client connected to auth service');
  }

  async createChat(ownerId: string, dto: CreateChatDto) {
    const title = dto.title?.trim() || 'new chat';

    const participants = new Set<string>([
      ownerId,
      ...(dto.participants ?? []),
    ]);

    if (participants.size === 0)
      throw new BadRequestException('Chat must have at least one participant');

    if (dto.type === 'direct' && participants.size !== 2)
      throw new BadRequestException(
        'Direct chat must have exact two participants'
      );

    const res: HandleValidationDto = await firstValueFrom(
      this.rabbitClient
        .send(
          { cmd: 'user.validate.exists' },
          { accountIds: [...participants] }
        )
        .pipe(
          timeout(3000),
          catchError((err) => {
            if (err?.name === 'TimeoutError') {
              return throwError(
                () =>
                  new ServiceUnavailableException(
                    'User validation service unavailable'
                  )
              );
            }
            return throwError(() => err);
          })
        )
    );

    if (res.missingIds.length > 0)
      throw new NotFoundException(
        `User not found ${res.missingIds.join(', ')}`
      );

    if (dto.type === 'direct') {
      const existingChat = await this.chatRepo.findOne({
        where: [
          { ownerId, type: 'direct' },
          {
            ownerId: [...participants].find((id) => id !== ownerId),
            type: 'direct',
          },
        ],
        relations: ['members'],
      });

      if (existingChat)
        throw new ConflictException(
          'Private chat between these users already exists'
        );
    }

    return this.dataSource.transaction(async (entityManager) => {
      const chatRepository = entityManager.getRepository(ChatEntity);
      const memberRepository = entityManager.getRepository(MemberEntity);

      const chat = await chatRepository.save({
        type: dto.type,
        title,
        avatarUrl: dto.avatarUrl ?? null,
        ownerId,
      });

      const memberEntities = [...participants].map((userId) => ({
        chatId: chat.id,
        userId,
        role: userId === ownerId ? 'owner' : 'member',
      }));

      await memberRepository
        .createQueryBuilder()
        .insert()
        .into(memberRepository.metadata.tableName)
        .values(memberEntities)
        .orIgnore()
        .execute();

      const cachedChats = `user:${ownerId}:chats`;
      this.redisClient.del(cachedChats)
      
      return {
        chat,
        participants: [...participants],
      };
      
    });



    // await this.publisher.publish("chat.topic", `chat.${chat.id}.created`, {
    //     chatId: chat.id,
    //     participants: Array.from(participants)
    // })
  }

  async getAllUsersChats(userId: string) {
    const cachedChats = `user:${userId}:chats`;

    const cached = await this.redisClient.get(cachedChats);
    if (cached) return JSON.parse(cached);

    const members = await this.memberRepo.find({
      where: { userId },
      relations: ['chat'],
    });

    const chats = members.map((member) => member.chat);

    await this.redisClient.set(cachedChats, JSON.stringify(chats));

    return chats;
  }

  async getChatParticipants(chatId: string) {
    const cachedParticipants = `chat:${chatId}:participants`;

    try {
      const cached = await this.redisClient.get(cachedParticipants);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      this.logger.error(`❌ Redis SMEMBERS failed for chat ${chatId}`, err as any)
    }

    const members = await this.memberRepo.find({ where: { chatId } });

    await this.redisClient.set(cachedParticipants, JSON.stringify(members));

    return members;
  }
}
