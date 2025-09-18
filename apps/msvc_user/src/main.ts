import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(UserModule, { cors: false });
  const cfg = app.get(ConfigService);

  const origin = cfg.get<string>('FRONT_ORIGIN') ?? 'http://localhost:5173';
  app.enableCors({
    origin, credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id'],
    maxAge: 86400,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: {enableImplicitConversion: true}
  }));
  app.enableShutdownHooks();

  const port = Number(cfg.get('PORT') ?? 3002);
  await app.listen(port);
  Logger.log(
    `user-svc: http://100.115.60.97:${port} (CORS: ${origin})`
  );
}

bootstrap();
