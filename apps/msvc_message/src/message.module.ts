import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessageEntity } from "./entities/message.entity";
import { ReadEntity } from "./entities/read.entity";
import { MessageController } from "./controllers/message.controller";
import { MessageService } from "./services/message.service";
import { PublishService } from "./services/publisher.service";
import { RedisProvider } from "./redis.provider";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                type: "postgres",
                url: cfg.get<string>("POSTGRES_URL") ,
                autoLoadEntities: true,
                synchronize: true,
                entities: [MessageEntity, ReadEntity],
                logging: cfg.get('NODE_ENV') !== 'production'
            })
        }),
        TypeOrmModule.forFeature([MessageEntity, ReadEntity]),

        ClientsModule.register([
            {
                name: "MSVC_MESSAGE",
                transport: Transport.RMQ,
                options: {
                    urls: ["amqp://rick:rick@rabbitmq:5672"],
                    queue: "chat.get.participants",
                    queueOptions: {
                        durable: true
                    }
                }
            }
        ])

    ],
    controllers: [MessageController],
    providers: [MessageService, PublishService, RedisProvider],
    exports: ["REDIS"]
})
export class MessageModule {};