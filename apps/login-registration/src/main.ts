import '../instrumentation';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { gatewayLogger } from '../../../libs/shared/logger/src';
import { WinstonModule } from 'nest-winston';
import { join } from 'path';

import { LoginRegistrationModule } from './login-registration.module';

async function bootstrap() {
  const grpcUrl = process.env.LOGIN_GRPC_URL || '0.0.0.0:5002';
  const httpPort = process.env.PORT || 3003;

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

  // Start microservices (starts the gRPC server listener)
  await app.startAllMicroservices();

  // Start HTTP listener
  await app.listen(httpPort);

  Logger.log(
    `⚙️ Login & Registration Microservice listening via HTTP (:${httpPort}) and gRPC (${grpcUrl})...`,
  );
}
bootstrap();
