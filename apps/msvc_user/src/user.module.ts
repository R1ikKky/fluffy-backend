import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { ContactEntity } from "./entities/contact.entity";
import { UserService } from "./services/user.service";
import { UserController } from "./controllers/user.controller";
import { ContactsService } from "./services/contacts.service";
import { PresenceService } from "./services/presence.service";
import { ContactsController } from "./controllers/contacts.controller";
import { PresenceController } from "./controllers/presence.controller";
import IORedis, { Redis } from 'ioredis';
import { AuthEventsListener } from "./listeners/auth.events.listener";

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
    controllers: [UserController, ContactsController, PresenceController, AuthEventsListener],
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