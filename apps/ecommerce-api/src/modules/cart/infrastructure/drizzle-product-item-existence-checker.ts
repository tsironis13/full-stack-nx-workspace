import { Injectable } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';

import { DrizzleService } from '../../../drizzle/drizzle.service';
import { productItems } from '../../../db/schema/product-items';
import { ProductItemExistenceChecker } from '../application/use-cases/merge-cart.use-case';

@Injectable()
export class DrizzleProductItemExistenceChecker
  implements ProductItemExistenceChecker
{
  constructor(private readonly drizzle: DrizzleService) {}

  async isActive(productItemId: number): Promise<boolean> {
    const [row] = await this.drizzle.db
      .select({ id: productItems.id })
      .from(productItems)
      .where(
        and(
          eq(productItems.id, productItemId),
          isNull(productItems.deletedAt),
        ),
      )
      .limit(1);

    return row !== undefined;
  }
}
