/** Loads catalog Products (plus Category, options, price) to embed. */
import type { ProductEmbeddingSource } from '../product-embedding.types';

export abstract class ProductEmbeddingSourceRepository {
  abstract loadAll(): Promise<ProductEmbeddingSource[]>;

  abstract loadByProductIds(
    productIds: number[]
  ): Promise<ProductEmbeddingSource[]>;
}
