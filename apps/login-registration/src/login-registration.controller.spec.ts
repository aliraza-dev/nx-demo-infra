import { Test, TestingModule } from '@nestjs/testing';
import { LoginRegistrationController } from './login-registration.controller';
import { LoginRegistrationService } from './login-registration.service';

describe('LoginRegistrationController', () => {
  let loginRegistrationController: LoginRegistrationController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LoginRegistrationController],
      providers: [LoginRegistrationService],
    }).compile();

    loginRegistrationController = app.get<LoginRegistrationController>(LoginRegistrationController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(loginRegistrationController.getHello()).toBe('Hello World!');
    });
  });
});
