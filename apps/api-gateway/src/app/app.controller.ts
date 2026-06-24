import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  private readonly winstonLogger = new Logger('WinstonLogger');
  constructor(private readonly appService: AppService) {}

  @Get()
  healthz() {
    console.log('Received request to / endpoint');
    this.logger.log('--- Gateway Endpoint Pinged Successfully ---');
    this.winstonLogger.log('--- Gateway Endpoint Pinged Successfully ---');

    return this.appService.healthz();
  }
}
