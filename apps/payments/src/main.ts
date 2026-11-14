import './instrumentation';

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';

import { PaymentsModule } from './payments.module';

async function bootstrap() {
  const protoPath = join(process.cwd(), 'libs/shared/proto/src/payment.proto');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'payments',
        url: '0.0.0.0:5000',
        protoPath,
      },
    },
  );
  await app.listen();
  Logger.log('🚀 Payments gRPC Microservice is listening on 0.0.0.0:5000');
}

bootstrap();
