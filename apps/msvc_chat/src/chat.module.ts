import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberEntity } from "./entities/member.entity";
import { ChatEntity } from "./entities/chat.entity";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ChatController } from "./controllers/chat.controller";
import { ChatService } from "./services/chat.service";
import { PublishService } from "./services/publisher.service";
import { MemberService } from "./services/members.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                type: "postgres",
                url: cfg.get<string>("POSTGRES_URL"),
                autoLoadEntities: true,
                synchronize: true,
                entities: [ChatEntity, MemberEntity],
                logging: cfg.get('NODE_ENV') !== 'production'
            }),
        }),
        TypeOrmModule.forFeature([ChatEntity, MemberEntity]),

        ClientsModule.register([
            {
                name: "MSVC_CHAT",
                transport: Transport.RMQ,
                options: {
                    urls: ["amqp://rick:rick@rabbitmq:5672"],
                    queue: "chat-queue",
                    queueOptions: {
                        durable: true
                    }
                }
            }
        ])
    ],
    providers: [ChatService, PublishService, MemberService],
    controllers: [ChatController]
})
export class ChatModule {}