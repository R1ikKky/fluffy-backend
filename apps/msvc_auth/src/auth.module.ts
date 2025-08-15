import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { JwtModule } from "@nestjs/jwt";

import * as fs from "fs"
import IORedis, { Redis } from 'ioredis';
import { connect, AmqpConnectionManager } from "amqp-connection-manager";
import { PasswordService } from "./services/password.service";
import { RefreshEntity } from "./entities/refresh.entity";

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
                synchronize: false,
                logging: cfg.get('NODE_ENV') !== 'production'
            })
        }),
        TypeOrmModule.forFeature([UserEntity, RefreshEntity]),

        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => {
                const PrivPath = cfg.get<string>("JWT_PRIVATE")
                const PubPath = cfg.get<string>("JWT_PUBLIC")

                if(PrivPath && PubPath && fs.existsSync(PrivPath) && fs.existsSync(PubPath)){
                    return {
                        privateKey: fs.readFileSync(PrivPath),
                        publicKey: fs.readFileSync(PubPath),
                        signOptions: {
                            algorithm: "RS256",
                            expiresIn: cfg.get<string>("ACCESS_TTL") ?? "15m",
                        },
                    };
                }

                return {
                    secret: cfg.get<string>("JWT_SECRET") ?? console.log("no secret"),
                    signOptions: { expiresIn: cfg.get<string>("ACCESS_TTL") ?? "15m" },
                };
            },
        }),
    ],

    controllers: [
        AuthController,
        OauthController,
    ],

    providers: [
        AuthService,
        OauthService,
        PasswordService,
        RateService,
        TokenService

        {
            provide: "REDIS",
            inject: [ConfigService],
            useFactory: (cfg: ConfigService): Redis => {
                const url = cfg.get<string>("REDIS_URL") ?? 'redis://127.0.0.1:6379';
                return new IORedis(url, { maxRetriesPerRequest: null });
            },
        },

        {
            provide: "AMQP",
            inject: [ConfigService],
            useFactory: (cfg: ConfigService): AmqpConnectionManager => {
                const url  = cfg.get<string>("RABBIT_URL");
                if(!url) return null as unknown as AmqpConnectionManager
                return connect([url], {reconnectTimeInSeconds: 5})
            },
        },
    ],
    exports: [
        JwtModule, TypeOrmModule, "REDIS", "AMQP"
    ]
})

export class AuthModule {}