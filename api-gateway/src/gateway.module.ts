import { Module } from "@nestjs/common";
import { WsGateway } from "./controllers/ws/ws.gateway";
import { RabbitListener } from "./controllers/ws/rabbit.listener";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { RedisModule } from "./redis.module";
import { ConfigModule } from "@nestjs/config";
import { JwtGuard } from "./guards/jwt.guard";
import { HttpModule } from "@nestjs/axios";
import { UserController } from "./controllers/rest/user.controller";
import { UserApiService } from "./services/user-api.service";
import { AuthController } from "./controllers/rest/auth.controller";
import { AuthApiService } from "./services/auth-api.service";
import { ContactsApiService } from "./services/contacts-api.service";
import { ContactsController } from "./controllers/rest/contacts.controller";


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
        HttpModule.register({ timeout: 3000 }),
        RedisModule
    ],
    controllers: [UserController, AuthController, ContactsController],
    providers: [WsGateway, RabbitListener, JwtGuard, UserApiService, AuthApiService, ContactsApiService]
})
export class GatewayModule {}