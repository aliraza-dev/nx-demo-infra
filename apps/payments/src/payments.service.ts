import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  processPayment(data: { orderId: string; amount: number; currency: string }) {
    this.logger.log(
      `Processing payment for order: ${data.orderId}, amount: ${data.amount} ${data.currency || 'USD'}`,
    );
    return {
      paymentId: `pay_${Date.now()}`,
      status: 'SUCCESS',
      message: 'Payment processed successfully',
    };
  }

  getPaymentStatus(data: { paymentId: string }) {
    this.logger.log(`Checking payment status for: ${data.paymentId}`);
    return {
      paymentId: data.paymentId,
      status: 'COMPLETED',
      message: 'Payment verified',
    };
  }

  getPaymentDetails(data: { orderId: string }) {
    this.logger.log(`Fetching dummy payment details for order: ${data.orderId}`);
    return {
      paymentId: `pay_${data.orderId}`,
      orderId: data.orderId,
      amount: 149.99,
      currency: 'USD',
      status: 'PAID',
      method: 'CREDIT_CARD',
      paidAt: new Date().toISOString(),
    };
  }
}
