import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ChatModule } from './chat.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ChatModule);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI ?? 'amqp://rick:rick@rabbitmq:5672'],
      queue: 'chat-queue', 
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  app.enableShutdownHooks();

  const port = process.env.PORT || 3004;
  await app.listen(port);
  Logger.log(`🚀 Chat service ready: http://localhost:${port}/chat`);
}

bootstrap();
