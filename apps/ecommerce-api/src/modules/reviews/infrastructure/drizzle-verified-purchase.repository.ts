import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { orders } from '../../../db/schema/orders';
import { orderItems } from '../../../db/schema/order-items';
import { productItems } from '../../../db/schema/product-items';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import { VerifiedPurchaseRepository } from '../domain/repositories/verified-purchase.repository';

const CONFIRMED = 'confirmed';

@Injectable()
export class DrizzleVerifiedPurchaseRepository extends VerifiedPurchaseRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async hasVerifiedPurchase(params: {
    userId: string;
    productId: number;
  }): Promise<boolean> {
    const [row] = await this.drizzle.db
      .select({ orderId: orders.id })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .innerJoin(productItems, eq(productItems.id, orderItems.productItemId))
      .where(
        and(
          eq(orders.userId, params.userId),
          eq(orders.status, CONFIRMED),
          eq(productItems.productId, params.productId),
        ),
      )
      .limit(1);

    return !!row;
  }
}
