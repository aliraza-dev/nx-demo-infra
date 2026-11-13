import '../instrumentation';

import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { WinstonModule } from 'nest-winston';
import { gatewayLogger } from '@observability-monorepo/logger';

import { LoginRegistrationModule } from './login-registration.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const grpcUrl = process.env.ORDER_GRPC_URL || '0.0.0.0:5002';
  const app = await NestFactory.create(LoginRegistrationModule, {
    logger: WinstonModule.createLogger({
      instance: gatewayLogger,
    }),
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'loginregistration',
      url: grpcUrl,
      protoPath: join(
        process.cwd(),
        'libs/shared/proto/src/login-registration.proto',
      ),
    },
  });

  await app.listen(process.env.port ?? 3000);

  Logger.log(
    `⚙️ Order Microservice is listening via TCP (127.0.0.1:3001) and gRPC (${grpcUrl})...`,
  );
}
bootstrap();
