import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DrizzleService } from '../../../drizzle/drizzle.service';
import { productItems } from '../../../db/schema/product-items';
import { products } from '../../../db/schema/products';
import { productImages } from '../../../db/schema/product-images';
import {
  ProductItemSnapshot,
  ProductItemSnapshotProvider,
} from '../application/use-cases/add-cart-item.use-case';

@Injectable()
export class DrizzleProductItemSnapshotProvider
  implements ProductItemSnapshotProvider
{
  constructor(private readonly drizzle: DrizzleService) {}

  async findById(id: number): Promise<ProductItemSnapshot | null> {
    const [row] = await this.drizzle.db
      .select({
        id: productItems.id,
        salePrice: productItems.salePrice,
        productName: products.name,
        imageUrl: productImages.url,
      })
      .from(productItems)
      .leftJoin(products, eq(productItems.productId, products.id))
      .leftJoin(productImages, eq(productImages.productItemId, productItems.id))
      .where(eq(productItems.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      salePrice: row.salePrice ?? 0,
      productName: row.productName ?? null,
      imageUrl: row.imageUrl ?? null,
    };
  }
}
