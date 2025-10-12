import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(UserModule, { cors: false });
  const cfg = app.get(ConfigService);

  const swaggerFile = path.resolve(__dirname, "../openapi.json")
  const document = JSON.parse(fs.readFileSync(swaggerFile, "utf-8"))

  SwaggerModule.setup("/docs", app, document)

  const origin = cfg.get<string>('FRONT_ORIGIN') ?? 'http://100.68.110.50:5173';

  app.enableCors({
    origin, credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ["amqp://rick:rick@rabbitmq:5672"],
      queue: "account-queue",
      // queueOptions: { durable: true },
      // noAck: false,
      // prefetchCount: 10
    }
  })

  await app.startAllMicroservices();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: {enableImplicitConversion: true}
  }));
  app.enableShutdownHooks();


  const port = Number(cfg.get('PORT') ?? 3002);
  await app.listen(port, "0.0.0.0");
  Logger.log(
    `user-svc: http://100.126.70.46:${port} (CORS: ${origin})`
  );
}

bootstrap();
