import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DrizzleService } from '../../../drizzle/drizzle.service';
import { orders } from '../../../db/schema/orders';
import { orderItems } from '../../../db/schema/order-items';
import { OrdersRepository } from '../domain/repositories/orders.repository';
import { Order } from '../domain/orders.types';

@Injectable()
export class DrizzleOrdersRepository implements OrdersRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async createOrder(params: {
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
  }): Promise<Order> {
    return this.drizzle.db.transaction(async (tx) => {
      const [insertedOrder] = await tx
        .insert(orders)
        .values({
          userId: params.userId,
          guestEmail: params.guestEmail,
          shippingAddress: params.shippingAddress,
          totalAmount: params.totalAmount,
          status: 'confirmed',
          paymentStatus: 'pending',
        })
        .returning();

      await tx.insert(orderItems).values(
        params.items.map((item) => ({
          orderId: insertedOrder.id,
          productItemId: item.productItemId,
          productName: item.productName,
          productCode: item.productCode,
          salePrice: item.salePrice,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
        }))
      );

      const insertedItems = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, insertedOrder.id));

      return {
        id: insertedOrder.id,
        userId: insertedOrder.userId,
        guestEmail: insertedOrder.guestEmail,
        status: insertedOrder.status,
        shippingAddress: JSON.parse(insertedOrder.shippingAddress),
        paymentStatus: insertedOrder.paymentStatus,
        totalAmount: insertedOrder.totalAmount ?? 0,
        createdAt: insertedOrder.createdAt,
        items: insertedItems.map((i) => ({
          productItemId: i.productItemId,
          productName: i.productName,
          productCode: i.productCode,
          salePrice: i.salePrice,
          originalPrice: i.originalPrice,
          quantity: i.quantity,
        })),
      };
    });
  }
}
