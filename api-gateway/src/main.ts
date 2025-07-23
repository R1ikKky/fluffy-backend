import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(GatewayModule,{
    transport: Transport.REDIS,
    options: {
      host: "redis",
      port: 6379
    }
  });
  await app.listen();
  Logger.log(
    `🚀 Application is running on: http://localhost:3000`
  );
}

bootstrap();
