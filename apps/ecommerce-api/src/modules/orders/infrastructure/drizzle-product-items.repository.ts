import { Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';

import { DrizzleService } from '../../../drizzle/drizzle.service';
import { productItems } from '../../../db/schema/product-items';
import { products } from '../../../db/schema/products';
import {
  ProductItemRecord,
  ProductItemsRepository,
} from '../domain/repositories/product-items.repository';

@Injectable()
export class DrizzleProductItemsRepository implements ProductItemsRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findByIds(ids: number[]): Promise<ProductItemRecord[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await this.drizzle.db
      .select({
        id: productItems.id,
        sku: productItems.sku,
        salePrice: productItems.salePrice,
        originalPrice: productItems.originalPrice,
        productName: products.name,
      })
      .from(productItems)
      .leftJoin(products, eq(productItems.productId, products.id))
      .where(inArray(productItems.id, ids));

    return rows.map((r) => ({
      id: r.id,
      sku: r.sku,
      salePrice: r.salePrice ?? 0,
      originalPrice: r.originalPrice ?? 0,
      productName: r.productName,
    }));
  }
}
