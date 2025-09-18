import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { ContactEntity } from "./entities/contact.entity";
import { UserService } from "./services/user.service";

import IORedis, { Redis } from 'ioredis';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                type: "postgres",
                url: cfg.get<string>("POSTGRES_URL"),
                autoLoadEntities: true,
                synchronize: true
            }),
        }),
        TypeOrmModule.forFeature([UserEntity, ContactEntity]),
    ],
    controllers: [UserController, ContactsController, PresenceController],
    providers: [UserService, ContactsService, PresenceService,
        {
        provide: 'REDIS',
        inject: [ConfigService],
        useFactory: (cfg: ConfigService): Redis =>
            new IORedis(cfg.get('REDIS_URL') ?? 'redis://127.0.0.1:6379', {
            maxRetriesPerRequest: null,
            }),
        }
    ]
})
export class UserModule {}