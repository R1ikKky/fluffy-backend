import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountEntity } from "./entities/account.entity";
import { JwtModule } from "@nestjs/jwt";
import { PasswordService } from "./services/password.service";
import { RefreshEntity } from "./entities/refresh.entity";
import { AuthService } from "./services/auth.service";
import { TokenService } from "./services/token.service";
import { AuthController } from "./controllers/auth.controller";
import { RedisProvider } from "./redis.provider";
import { ClientsModule, Transport } from "@nestjs/microservices";

import * as fs from 'fs';
import { join } from 'path';

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
                entities: [AccountEntity, RefreshEntity],
                logging: cfg.get('NODE_ENV') !== 'production'
            })
        }),
        TypeOrmModule.forFeature([AccountEntity, RefreshEntity]),

        JwtModule.register({
            privateKey: fs.readFileSync(join(__dirname, "../secrets/jwtRS256.key")),
            publicKey: fs.readFileSync(join(__dirname, "../secrets/jwtRS256.key.pub")),
            signOptions: {
                algorithm: "RS256",
                expiresIn: "15m"
            }
        }),

        ClientsModule.register([
            {
                name: "MSVC_AUTH",
                transport: Transport.RMQ,
                options: {
                    urls: ["amqp://rick:rick@rabbitmq:5672"],
                    queue: "account-queue",
                    queueOptions: {
                        durable: true
                    },
                }
            }
        ]),
        
    ],

    controllers: [
        AuthController,
        //OauthController,
    ],

    providers: [
        AuthService,
        //OauthService,
        PasswordService,
        //RateService,
        TokenService,
        RedisProvider,

    ],
    exports: [
        JwtModule, TypeOrmModule, "REDIS",  
    ]
})

export class AuthModule {}