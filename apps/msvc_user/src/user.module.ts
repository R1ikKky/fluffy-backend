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
import { AuthEventsListener } from "./listeners/auth.events.listener";
import { RedisProvider } from "./redis.provider";
import { ChatEventsListener } from "./listeners/chat.events.listener";


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
    controllers: [UserController, ContactsController, PresenceController, AuthEventsListener, ChatEventsListener],
    providers: [UserService, ContactsService, PresenceService, RedisProvider],
    exports: ["REDIS"]
})
export class UserModule {}