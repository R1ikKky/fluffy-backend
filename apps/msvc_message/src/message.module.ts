import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MessageEntity } from "./entities/message.entity";
import { ReadEntity } from "./entities/read.entity";
import { MessageController } from "./controllers/message.controller";
import { MessageService } from "./services/message.service";
import { PublishService } from "./services/publisher.service";

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
    ],
    controllers: [MessageController],
    providers: [MessageService, PublishService],
})
export class MessageModule {};