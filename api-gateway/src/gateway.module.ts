import { Module } from '@nestjs/common';
import { WsGateway } from './controllers/ws/ws.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtGuard } from './guards/jwt.guard';
import { HttpModule } from '@nestjs/axios';
import { UserController } from './controllers/rest/user.controller';
import { UserApiService } from './services/user-api.service';
import { AuthController } from './controllers/rest/auth.controller';
import { AuthApiService } from './services/auth-api.service';
import { ContactsApiService } from './services/contacts-api.service';
import { ContactsController } from './controllers/rest/contacts.controller';
import { PresenceService } from './controllers/ws/presence.service';
import { AmqpConnectionManager, connect } from 'amqp-connection-manager';
import { RabbitListener } from './controllers/ws/rabbit.listener';
import { MessageApiService } from './services/message-api.service';
import { MessageController } from './controllers/rest/message.controller';
import { ChatController } from './controllers/rest/chats.controller';
import { ChatApiService } from './services/chat-api.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [],
      synchronize: true,
    }),
    HttpModule.register({ timeout: 3000 }),
    RedisModule,
  ],
  controllers: [UserController, AuthController, ContactsController, MessageController, ChatController],
  providers: [
    WsGateway,
    JwtGuard,
    UserApiService,
    AuthApiService,
    MessageApiService,
    ContactsApiService,
    ChatApiService,
    PresenceService,
    RabbitListener,
    {
        provide: "AMQP",
        useFactory: (cfg: ConfigService): AmqpConnectionManager =>
            connect([cfg.get("RABBIT_URL") ?? "amqp://rick:rick@localhost:5672"]),
        inject: [ConfigService]
    }
  ], 
})
export class GatewayModule {}
