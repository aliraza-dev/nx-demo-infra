import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  const mockOrderService = {
    getOrderDetails: jest.fn((dto) =>
      of({
        orderId: dto.orderId,
        customerName: dto.customerName,
        items: dto.items ?? [],
        totalAmount: 149.99,
        status: 'CONFIRMED',
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
    ),
  };

  const mockPaymentsService = {
    getPaymentDetails: jest.fn(({ orderId }) =>
      of({
        paymentId: `pay_${orderId}`,
        orderId,
        amount: 149.99,
        currency: 'USD',
        status: 'PAID',
        method: 'CREDIT_CARD',
        paidAt: '2026-01-01T00:00:00.000Z',
      }),
    ),
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: 'ORDER_SERVICE',
          useValue: { getService: () => mockOrderService },
        },
        {
          provide: 'PAYMENTS_SERVICE',
          useValue: { getService: () => mockPaymentsService },
        },
      ],
    }).compile();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('healthz', () => {
    it('should return "Health check passed in Api Gateway"', () => {
      const appController = app.get<AppController>(AppController);

      expect(appController.healthz()).toEqual({
        message: 'Health check passed in Api Gateway',
      });
    });
  });

  describe('login', () => {
    it('should return "Login successful" message', () => {
      const appController = app.get<AppController>(AppController);
      const loginDto = { email: 'random@email.com', password: 'password' };

      expect(appController.login(loginDto)).toEqual({
        message: 'Login successful',
      });
    });
  });

  describe('getOrderDetails', () => {
    it('should aggregate order and payment details via gRPC', async () => {
      const appController = app.get<AppController>(AppController);
      const result = await appController.getOrderDetails({
        orderId: 'ord-101',
        customerName: 'Alice',
        items: [{ productId: 'p1', name: 'Widget', quantity: 1, price: 149.99 }],
      });

      expect(result.message).toBe('Order details fetched successfully');
      expect(result.order.orderId).toBe('ord-101');
      expect(result.payment.paymentId).toBe('pay_ord-101');
    });
  });
});
