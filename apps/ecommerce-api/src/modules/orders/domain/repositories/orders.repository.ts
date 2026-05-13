import { Order } from '../orders.types';

export abstract class OrdersRepository {
  abstract createOrder(params: {
    userId: string | null;
    guestEmail: string | null;
    shippingAddress: string;
    totalAmount: number;
    items: {
      productItemId: number;
      productName: string | null;
      productCode: string | null;
      salePrice: number;
      originalPrice: number;
      quantity: number;
    }[];
  }): Promise<Order>;
}
