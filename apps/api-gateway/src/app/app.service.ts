import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { LoginDto, OrderDetailsDto, OrderItemDto } from './dto';

export interface OrderDetailsGrpcResponse {
  orderId: string;
  customerName: string;
  items: OrderItemDto[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface PaymentDetailsGrpcResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  paidAt: string;
}

interface OrderGrpcService {
  getOrderDetails(data: OrderDetailsDto): Observable<OrderDetailsGrpcResponse>;
}

interface PaymentsGrpcService {
  getPaymentDetails(data: {
    orderId: string;
  }): Observable<PaymentDetailsGrpcResponse>;
}

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  private orderService!: OrderGrpcService;
  private paymentsService!: PaymentsGrpcService;

  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientGrpc,
    @Inject('PAYMENTS_SERVICE') private readonly paymentsClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderService =
      this.orderClient.getService<OrderGrpcService>('OrderService');
    this.paymentsService =
      this.paymentsClient.getService<PaymentsGrpcService>('PaymentsService');
  }

  healthz(): { message: string } {
    return { message: 'Health check passed in Api Gateway' };
  }

  login(loginDto: LoginDto): { message: string } {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    return { message: 'Login successful' };
  }

  async getOrderDetails(orderDetailsDto: OrderDetailsDto) {
    this.logger.log(
      `Fetching order and payment details via gRPC for orderId=${orderDetailsDto.orderId}`,
    );

    try {
      const [order, payment] = await Promise.all([
        firstValueFrom(this.orderService.getOrderDetails(orderDetailsDto)),
        firstValueFrom(
          this.paymentsService.getPaymentDetails({
            orderId: orderDetailsDto.orderId,
          }),
        ),
      ]);

      return {
        message: 'Order details fetched successfully',
        order,
        payment,
      };
    } catch (error) {
      this.logger.error(
        `gRPC call failed for orderId=${orderDetailsDto.orderId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new ServiceUnavailableException(
        'Failed to fetch order or payment details from downstream gRPC services',
      );
    }
  }
}
