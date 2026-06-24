import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
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
});
