import { Module } from "@nestjs/common";
import { WsGateway } from "./controllers/ws/ws.gateway";
import { RabbitListener } from "./controllers/ws/rabbit.listener";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { RedisModule } from "./redis.module";
import { ConfigModule } from "@nestjs/config";


@Module({
    
    imports: [
        ConfigModule.forRoot({
        isGlobal: true,
    }),
        TypeOrmModule.forRoot({
        type: "postgres",
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT),
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        entities: [],
        synchronize: true,
    }),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: "15m" }
        }),
        RedisModule
    ],
    controllers: [],
    providers: [WsGateway, RabbitListener]
})
export class GatewayModule {}