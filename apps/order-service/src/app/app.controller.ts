import { Controller, Get, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AppService,
  OrderDetailsRequest,
  OrderDetailsResponse,
} from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    console.log('Received request to / endpoint');
    this.logger.log('--- Order Service Endpoint Pinged Successfully ---');
    return this.appService.getData();
  }

  @GrpcMethod('OrderService', 'GetOrderDetails')
  getOrderDetails(data: OrderDetailsRequest): OrderDetailsResponse {
    this.logger.log(
      `--- gRPC GetOrderDetails invoked for orderId=${data.orderId} ---`,
    );
    return this.appService.getOrderDetails(data);
  }
}
