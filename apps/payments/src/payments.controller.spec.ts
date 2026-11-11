import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

describe('PaymentsController', () => {
  let paymentsController: PaymentsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [PaymentsService],
    }).compile();

    paymentsController = app.get<PaymentsController>(PaymentsController);
  });

  describe('getPaymentDetails', () => {
    it('should return dummy payment details for an orderId', () => {
      const result = paymentsController.getPaymentDetails({ orderId: 'ord-123' });
      expect(result).toMatchObject({
        paymentId: 'pay_ord-123',
        orderId: 'ord-123',
        amount: 149.99,
        currency: 'USD',
        status: 'PAID',
        method: 'CREDIT_CARD',
      });
      expect(result.paidAt).toBeDefined();
    });
  });
});
