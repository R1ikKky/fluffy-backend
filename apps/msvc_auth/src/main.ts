import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const cfg = app.get(ConfigService);

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
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
  console.log(`auth-service: http://100.126.70.46:${port}  (CORS origin: http://100.126.70.46:3000)`);
}

bootstrap();
