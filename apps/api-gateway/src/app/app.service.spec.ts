import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AppService } from './app.service';
import { UserRole } from './auth';

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

  const mockLoginRegistrationService = {
    login: jest.fn((dto) =>
      of({
        success: true,
        message: 'Login successful',
        userId: '1',
        email: dto.email,
        token: 'test-token',
        role: UserRole.DEVELOPER,
      }),
    ),
    register: jest.fn((dto) =>
      of({
        success: true,
        message: 'User registered successfully',
        userId: '1',
        email: dto.email,
        role: dto.role || UserRole.DEVELOPER,
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
        {
          provide: 'LOGIN_REGISTRATION_SERVICE',
          useValue: { getService: () => mockLoginRegistrationService },
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
    it('should call LoginRegistrationService via gRPC and return response with role', async () => {
      const loginDto = { email: 'random@email.com', password: 'password' };
      const res = await service.login(loginDto);
      expect(mockLoginRegistrationService.login).toHaveBeenCalledWith(loginDto);
      expect(res).toEqual({
        success: true,
        message: 'Login successful',
        userId: '1',
        email: 'random@email.com',
        token: 'test-token',
        role: UserRole.DEVELOPER,
      });
    });
  });

  describe('register', () => {
    it('should call LoginRegistrationService register via gRPC and return response with role', async () => {
      const registerDto = {
        email: 'dev@email.com',
        password: 'password',
        role: UserRole.DEVELOPER,
      };
      const res = await service.register(registerDto);
      expect(mockLoginRegistrationService.register).toHaveBeenCalledWith(
        registerDto,
      );
      expect(res).toEqual({
        success: true,
        message: 'User registered successfully',
        userId: '1',
        email: 'dev@email.com',
        role: UserRole.DEVELOPER,
      });
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
