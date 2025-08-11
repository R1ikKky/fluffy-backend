
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, { cors: false });
  const cfg = app.get(ConfigService);

  const origin = cfg.get<string>("FRONT_ORIGIN") ?? 'http://localhost:5173';

  app.enableCors({
    origin,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-Request-Id"],
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix("v1");
  app.enableShutdownHooks();

  const port = Number(cfg.get("AUTH_PORT") ?? "3001");
  app.listen(port);
  console.log(`auth-service: http://localhost:${port}  (CORS origin: ${origin})`);
}

bootstrap();
