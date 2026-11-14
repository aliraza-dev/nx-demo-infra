import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { LoginDto, OrderDetailsDto, OrderItemDto, RegisterDto } from './dto';

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

export interface LoginGrpcResponse {
  success: boolean;
  message: string;
  userId: string;
  email: string;
  token: string;
  role: string;
}

export interface RegisterGrpcResponse {
  success: boolean;
  message: string;
  userId: string;
  email: string;
  role: string;
}

interface OrderGrpcService {
  getOrderDetails(data: OrderDetailsDto): Observable<OrderDetailsGrpcResponse>;
}

interface PaymentsGrpcService {
  getPaymentDetails(data: {
    orderId: string;
  }): Observable<PaymentDetailsGrpcResponse>;
}

interface LoginRegistrationGrpcService {
  login(data: LoginDto): Observable<LoginGrpcResponse>;
  register(data: RegisterDto): Observable<RegisterGrpcResponse>;
}

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  private orderService!: OrderGrpcService;
  private paymentsService!: PaymentsGrpcService;
  private loginRegistrationService!: LoginRegistrationGrpcService;

  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientGrpc,
    @Inject('PAYMENTS_SERVICE') private readonly paymentsClient: ClientGrpc,
    @Inject('LOGIN_REGISTRATION_SERVICE')
    private readonly loginRegistrationClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderService =
      this.orderClient.getService<OrderGrpcService>('OrderService');
    this.paymentsService =
      this.paymentsClient.getService<PaymentsGrpcService>('PaymentsService');
    this.loginRegistrationService =
      this.loginRegistrationClient.getService<LoginRegistrationGrpcService>(
        'LoginRegistrationService',
      );
  }

  healthz(): { message: string } {
    return { message: 'Health check passed in Api Gateway' };
  }

  async login(loginDto: LoginDto): Promise<LoginGrpcResponse> {
    this.logger.log(`Routing login request for email: ${loginDto.email} to LoginRegistrationService via gRPC`);

    try {
      const response = await firstValueFrom(
        this.loginRegistrationService.login(loginDto),
      );

      if (!response.success) {
        throw new UnauthorizedException(
          response.message || 'Invalid email or password',
        );
      }

      return response;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Login gRPC call failed for email=${loginDto.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new ServiceUnavailableException(
        'Failed to connect to Login & Registration gRPC service',
      );
    }
  }

  async register(registerDto: RegisterDto): Promise<RegisterGrpcResponse> {
    this.logger.log(`Routing registration request for email: ${registerDto.email} to LoginRegistrationService via gRPC`);

    try {
      const response = await firstValueFrom(
        this.loginRegistrationService.register(registerDto),
      );

      if (!response.success) {
        throw new BadRequestException(
          response.message || 'Registration failed',
        );
      }

      return response;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Registration gRPC call failed for email=${registerDto.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new ServiceUnavailableException(
        'Failed to connect to Login & Registration gRPC service',
      );
    }
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
