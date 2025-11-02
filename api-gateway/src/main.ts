import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { GatewayModule } from './gateway.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import cookieParser from 'cookie-parser';



async function bootstrap() {

  const app = await NestFactory.create(GatewayModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:4200', 
    credentials: true,
  });

  const swaggerFile = path.resolve(__dirname, "../swagger.json")
  const document = JSON.parse(fs.readFileSync(swaggerFile, "utf-8"))
  SwaggerModule.setup('docs', app, document);


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
  Logger.log(`Swagger: http://100.126.70.46:${port}/docs`);
  Logger.log(`Redis microservice connected to ${process.env.REDIS_HOST ?? 'redis'}:${process.env.REDIS_PORT ?? 6379}`);
}

bootstrap();
