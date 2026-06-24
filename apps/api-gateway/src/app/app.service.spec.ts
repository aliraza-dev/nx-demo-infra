import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
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
});
