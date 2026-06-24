import './instrumentation';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { gatewayLogger } from '@observability-monorepo/logger';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '127.0.0.1',
        port: 3001,
      },
      logger: WinstonModule.createLogger({
        instance: gatewayLogger,
      }),
    },
  );
  await app.listen();
  Logger.log(`⚙️ Order Microservice is listening via TCP on port 3001...`);
}

bootstrap();
