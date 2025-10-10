
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule, { cors: false });
  const cfg = app.get(ConfigService);

  const origin = cfg.get<string>("CORS_ORIGIN") ?? 'http://localhost:3000';

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

  app.enableShutdownHooks();

  const port = Number(cfg.get('AUTH_PORT')) ||
    Number(process.env.PORT) ||
    3001;
   await app.listen(port, "0.0.0.0");
  console.log(`auth-service: http://100.126.70.46:${port}  (CORS origin: ${origin})`);
}

bootstrap();
