import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from './auth/roles.enum';
import { LoginRegistrationController } from './login-registration.controller';
import { LoginRegistrationService } from './login-registration.service';
import { UsersService } from './users.service';

describe('LoginRegistrationController', () => {
  let loginRegistrationController: LoginRegistrationController;
  let mockLoginRegistrationService: Partial<LoginRegistrationService>;
  let mockUsersService: Partial<UsersService>;

  beforeEach(async () => {
    mockLoginRegistrationService = {
      getHello: jest
        .fn()
        .mockReturnValue('Login & Registration Service operational'),
      login: jest.fn().mockResolvedValue({
        success: true,
        message: 'Login successful',
        userId: '1',
        email: 'test@example.com',
        token: 'test-token',
        role: UserRole.DEVELOPER,
      }),
      register: jest.fn().mockResolvedValue({
        success: true,
        message: 'User registered successfully',
        userId: '1',
        email: 'test@example.com',
        role: UserRole.DEVELOPER,
      }),
      validateToken: jest.fn().mockResolvedValue({
        valid: true,
        userId: '1',
        email: 'test@example.com',
        role: UserRole.DEVELOPER,
      }),
    };

    mockUsersService = {
      findAll: jest.fn().mockResolvedValue([
        {
          id: 1,
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [LoginRegistrationController],
      providers: [
        {
          provide: LoginRegistrationService,
          useValue: mockLoginRegistrationService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    loginRegistrationController = app.get<LoginRegistrationController>(
      LoginRegistrationController,
    );
  });

  describe('healthz', () => {
    it('should return service operational status', () => {
      expect(loginRegistrationController.getHello()).toBe(
        'Login & Registration Service operational',
      );
    });
  });

  describe('login', () => {
    it('should authenticate user and return login result with role', async () => {
      const res = await loginRegistrationController.login({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(res.success).toBe(true);
      expect(res.userId).toBe('1');
      expect(res.role).toBe(UserRole.DEVELOPER);
    });
  });

  describe('admin route', () => {
    it('should list all users for admin', async () => {
      const res = await loginRegistrationController.getAdminUsers();
      expect(res.users).toHaveLength(1);
      expect(res.users[0].role).toBe(UserRole.ADMIN);
    });
  });
});
