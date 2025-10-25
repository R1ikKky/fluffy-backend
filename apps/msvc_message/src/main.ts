import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MessageModule } from './message.module';

async function bootstrap() {
  const app = await NestFactory.create(MessageModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = parseInt(process.env.PORT || '3003', 10);
  await app.listen(port);
  Logger.log(`🚀 Message service ready: http://localhost:${port}/message`);
}

bootstrap();
