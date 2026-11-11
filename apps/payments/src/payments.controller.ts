import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @GrpcMethod('PaymentsService', 'ProcessPayment')
  processPayment(data: { orderId: string; amount: number; currency: string }) {
    return this.paymentsService.processPayment(data);
  }

  @GrpcMethod('PaymentsService', 'GetPaymentStatus')
  getPaymentStatus(data: { paymentId: string }) {
    return this.paymentsService.getPaymentStatus(data);
  }

  @GrpcMethod('PaymentsService', 'GetPaymentDetails')
  getPaymentDetails(data: { orderId: string }) {
    return this.paymentsService.getPaymentDetails(data);
  }
}
