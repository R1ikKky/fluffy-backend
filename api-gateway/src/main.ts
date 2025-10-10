import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {

  const app = await NestFactory.create(GatewayModule,{
    cors: false
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_HOST ?? 'redis',
      port: Number(process.env.REDIS_PORT ?? 6379)
    }
  })

  await app.startAllMicroservices();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, "0.0.0.0");
  Logger.log(`HTTP:  http://100.126.70.46:${port}`);
  Logger.log(`Redis microservice connected to ${process.env.REDIS_HOST ?? 'redis'}:${process.env.REDIS_PORT ?? 6379}`);
}

bootstrap();
