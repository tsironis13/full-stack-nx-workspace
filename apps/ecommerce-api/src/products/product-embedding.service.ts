import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service';
import { productEmbeddings } from '../db/schema/product-embeddings';
import { embedProduct } from '../flows/embed-product.flow';
import { products } from '../db/schema/products';
import { productCategories } from '../db/schema/product-categories';

@Injectable()
export class ProductEmbeddingService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async embedAndStore() {
    const productEmbeddingsRecords = await this.drizzleService.db
      .select()
      .from(productEmbeddings);

    if (productEmbeddingsRecords.length > 1) {
      return;
    }

    const productRecords = await this.drizzleService.db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categoryName: productCategories.name,
        categoryId: products.categoryId,
      })
      .from(products)
      .leftJoin(
        productCategories,
        eq(products.categoryId, productCategories.id)
      );

    for (const product of productRecords) {
      const { embedding } = await embedProduct({
        name: product.name ?? '',
        description: product.description ?? '',
        category: product.categoryName ?? '',
      });

      await this.drizzleService.db.insert(productEmbeddings).values({
        productId: product.id,
        categoryId: product.categoryId,
        embedding,
      });
    }
  }
}
