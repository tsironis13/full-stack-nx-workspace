import { and, eq, asc, count, ne, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { productImages, productItems, products } from '../db/schema';
import { DrizzleService } from '../drizzle/drizzle.service';

export const getProducts = (drizzleService: DrizzleService) => {
  if (!drizzleService) {
    throw new Error('Drizzle service is required');
  }

  const productImageSubquery = drizzleService.db
    .select({ url: productImages.url })
    .from(productImages)
    .where(eq(productImages.productItemId, productItems.id))
    .orderBy(asc(productImages.id))
    .limit(1)
    .as('img');

  const pi2 = alias(productItems, 'pi2');

  const variationsCountSubquery = drizzleService.db
    .select({ variations_count: count().as('variations_count') })
    .from(pi2)
    .where(
      and(
        eq(pi2.productId, productItems.productId), // same product
        ne(pi2.id, productItems.id) // exclude self
      )
    )
    .as('variations_count');

  return drizzleService.db
    .select({
      id: products.id,
      product_item_id: productItems.id,
      sku: productItems.sku,
      category_id: products.categoryId,
      name: products.name,
      description: products.description,
      original_price: productItems.originalPrice,
      sale_price: productItems.salePrice,
      image_url: productImageSubquery.url,
      variations_count: variationsCountSubquery.variations_count,
    })
    .from(products)
    .innerJoin(productItems, eq(productItems.productId, products.id))
    .leftJoinLateral(variationsCountSubquery, sql`true`)
    .leftJoinLateral(productImageSubquery, sql`true`)
    .where(eq(productItems.isMainProduct, true));
};
