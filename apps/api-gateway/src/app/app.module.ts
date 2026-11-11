import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'orders',
          protoPath: join(process.cwd(), 'libs/shared/proto/src/order.proto'),
          url: process.env.ORDER_GRPC_URL || '127.0.0.1:5001',
        },
      },
      {
        name: 'PAYMENTS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'payments',
          protoPath: join(process.cwd(), 'libs/shared/proto/src/payment.proto'),
          url: process.env.PAYMENTS_GRPC_URL || '127.0.0.1:5000',
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
