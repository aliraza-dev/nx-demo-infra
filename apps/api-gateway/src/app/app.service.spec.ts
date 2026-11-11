import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AppService } from './app.service';

describe('AppService', () => {
  let moduleRef: TestingModule;
  let service: AppService;

  const mockOrderService = {
    getOrderDetails: jest.fn((dto) =>
      of({
        orderId: dto.orderId,
        customerName: dto.customerName,
        items: dto.items ?? [],
        totalAmount: 50,
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
        amount: 50,
        currency: 'USD',
        status: 'PAID',
        method: 'CREDIT_CARD',
        paidAt: '2026-01-01T00:00:00.000Z',
      }),
    ),
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
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

    await moduleRef.init();
    service = moduleRef.get<AppService>(AppService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe('healthCheck', () => {
    it('should return "Health check passed in Api Gateway"', () => {
      expect(service.healthz()).toEqual({
        message: 'Health check passed in Api Gateway',
      });
    });
  });

  describe('login', () => {
    it('should return "Login successful" message', () => {
      const loginDto = { email: 'random@email.com', password: 'password' };
      expect(service.login(loginDto)).toEqual({ message: 'Login successful' });
    });
  });

  describe('getOrderDetails', () => {
    it('should call OrderService and PaymentsService via gRPC', async () => {
      const result = await service.getOrderDetails({
        orderId: 'ord-202',
        customerName: 'Bob',
      });

      expect(mockOrderService.getOrderDetails).toHaveBeenCalledWith({
        orderId: 'ord-202',
        customerName: 'Bob',
      });
      expect(mockPaymentsService.getPaymentDetails).toHaveBeenCalledWith({
        orderId: 'ord-202',
      });
      expect(result.order.status).toBe('CONFIRMED');
      expect(result.payment.status).toBe('PAID');
    });
  });
});
