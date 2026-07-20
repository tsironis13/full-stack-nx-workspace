import { Injectable } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';

import { DrizzleService } from '../../../drizzle/drizzle.service';
import { orders } from '../../../db/schema/orders';
import { orderItems } from '../../../db/schema/order-items';
import { productItems } from '../../../db/schema/product-items';
import { productReviews } from '../../../db/schema/product-reviews';
import { OrderHistoryRepository } from '../domain/repositories/order-history.repository';
import type {
  OrderHistoryOrderRecord,
  OrderHistoryLineItemRecord,
} from '../domain/order-history.types';

const CONFIRMED = 'confirmed';

@Injectable()
export class DrizzleOrderHistoryRepository extends OrderHistoryRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async findConfirmedOrdersWithReviewStatus(params: {
    userId: string;
  }): Promise<OrderHistoryOrderRecord[]> {
    const rows = await this.drizzle.db
      .select({
        orderId: orders.id,
        status: orders.status,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        productItemId: orderItems.productItemId,
        productId: productItems.productId,
        productName: orderItems.productName,
        productCode: orderItems.productCode,
        salePrice: orderItems.salePrice,
        quantity: orderItems.quantity,
        reviewId: productReviews.id,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .innerJoin(productItems, eq(productItems.id, orderItems.productItemId))
      .leftJoin(
        productReviews,
        and(
          eq(productReviews.productId, productItems.productId),
          eq(productReviews.userId, orders.userId),
          isNull(productReviews.hiddenAt),
        ),
      )
      .where(and(eq(orders.userId, params.userId), eq(orders.status, CONFIRMED)))
      .orderBy(desc(orders.createdAt), desc(orders.id), orderItems.id);

    const byOrderId = new Map<number, OrderHistoryOrderRecord>();

    for (const row of rows) {
      let order = byOrderId.get(row.orderId);
      if (!order) {
        order = {
          id: row.orderId,
          status: row.status,
          totalAmount: row.totalAmount ?? 0,
          createdAt: row.createdAt,
          items: [],
        };
        byOrderId.set(row.orderId, order);
      }

      const item: OrderHistoryLineItemRecord = {
        productItemId: row.productItemId,
        productId: row.productId,
        productName: row.productName,
        productCode: row.productCode,
        salePrice: row.salePrice,
        quantity: row.quantity,
        visibleReviewId: row.reviewId ?? null,
      };
      order.items.push(item);
    }

    return [...byOrderId.values()];
  }
}
