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

  describe('getData', () => {
    it('should return "Hello API"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getData()).toEqual({ message: 'Hello API' });
    });
  });

  describe('getOrderDetails', () => {
    it('should return order details with computed totalAmount', () => {
      const appController = app.get<AppController>(AppController);
      const result = appController.getOrderDetails({
        orderId: 'ord-123',
        customerName: 'Alice',
        items: [
          { productId: 'p1', name: 'Laptop', quantity: 2, price: 500 },
        ],
      });

      expect(result.orderId).toBe('ord-123');
      expect(result.customerName).toBe('Alice');
      expect(result.totalAmount).toBe(1000);
      expect(result.status).toBe('CONFIRMED');
    });
  });
});
