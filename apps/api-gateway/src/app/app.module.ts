import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JWT_SECRET, JwtStrategy, RolesGuard } from './auth';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
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
      {
        name: 'LOGIN_REGISTRATION_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'loginregistration',
          protoPath: join(
            process.cwd(),
            'libs/shared/proto/src/login-registration.proto',
          ),
          url: process.env.LOGIN_GRPC_URL || '127.0.0.1:5002',
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, RolesGuard],
})
export class AppModule {}
