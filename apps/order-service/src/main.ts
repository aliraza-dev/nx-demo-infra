import './instrumentation';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';
import { gatewayLogger } from '@observability-monorepo/logger';
import { WinstonModule } from 'nest-winston';

async function bootstrap() {
  const grpcUrl = process.env.ORDER_GRPC_URL || '0.0.0.0:5001';
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: gatewayLogger,
    }),
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 3001,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'orders',
      url: grpcUrl,
      protoPath: join(process.cwd(), 'libs/shared/proto/src/order.proto'),
    },
  });

  await app.startAllMicroservices();
  Logger.log(
    `⚙️ Order Microservice is listening via TCP (127.0.0.1:3001) and gRPC (${grpcUrl})...`,
  );
}

bootstrap();
