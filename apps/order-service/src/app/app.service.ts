import { Injectable, Logger } from '@nestjs/common';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderDetailsRequest {
  orderId: string;
  customerName: string;
  items?: OrderItem[];
}

export interface OrderDetailsResponse {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  getOrderDetails(data: OrderDetailsRequest): OrderDetailsResponse {
    this.logger.log(`Fetching order details via gRPC for order: ${data.orderId}`);
    const items: OrderItem[] =
      data.items && data.items.length > 0
        ? data.items
        : [
            {
              productId: 'prod-001',
              name: 'Default Observability Kit',
              quantity: 1,
              price: 149.99,
            },
          ];

    const totalAmount = items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );

    return {
      orderId: data.orderId,
      customerName: data.customerName,
      items,
      totalAmount: Number(totalAmount.toFixed(2)),
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };
  }
}
