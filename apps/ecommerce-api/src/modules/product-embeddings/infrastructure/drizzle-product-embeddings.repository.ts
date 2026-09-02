/**
 * Drizzle access to `product_embeddings`: upsert 1024D vectors and cosine
 * nearest-neighbor search (`<=>` / pgvector HNSW).
 */
import { Injectable } from '@nestjs/common';
import { eq, isNull, sql } from 'drizzle-orm';

import { PRODUCT_EMBEDDING_DIMENSIONS } from '../../../db/schema/product-embeddings';
import { productEmbeddings } from '../../../db/schema/product-embeddings';
import { products } from '../../../db/schema/products';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import type {
  IndexedProductEmbedding,
  ProductEmbeddingSearchHit,
} from '../domain/product-embedding.types';
import { ProductEmbeddingsRepository } from '../domain/repositories/product-embeddings.repository';

@Injectable()
export class DrizzleProductEmbeddingsRepository extends ProductEmbeddingsRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async upsertMany(rows: IndexedProductEmbedding[]): Promise<void> {
    if (rows.length === 0) {
      return;
    }

    const now = new Date();
    await this.drizzle.db
      .insert(productEmbeddings)
      .values(
        rows.map((row) => ({
          productId: row.productId,
          content: row.content,
          embedding: row.embedding,
          model: row.model,
          updatedAt: now,
        }))
      )
      .onConflictDoUpdate({
        target: productEmbeddings.productId,
        set: {
          content: sql`excluded.content`,
          embedding: sql`excluded.embedding`,
          model: sql`excluded.model`,
          updatedAt: now,
        },
      });
  }

  async searchByEmbedding(params: {
    embedding: number[];
    limit: number;
  }): Promise<ProductEmbeddingSearchHit[]> {
    const vectorLiteral = toVectorLiteral(params.embedding);
    const distance = sql<number>`${productEmbeddings.embedding} <=> ${sql.raw(`'${vectorLiteral}'::vector`)}`;
    const similarity = sql<number>`1 - (${distance})`;

    const rows = await this.drizzle.db
      .select({
        productId: productEmbeddings.productId,
        name: products.name,
        similarity,
      })
      .from(productEmbeddings)
      .innerJoin(products, eq(products.id, productEmbeddings.productId))
      .where(isNull(products.deletedAt))
      .orderBy(distance)
      .limit(params.limit);

    return rows.map((row) => ({
      productId: Number(row.productId),
      name: row.name,
      similarity: Number(row.similarity),
    }));
  }
}

function toVectorLiteral(values: number[]): string {
  if (values.length !== PRODUCT_EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${PRODUCT_EMBEDDING_DIMENSIONS}-dimensional embedding, got ${values.length}`
    );
  }
  if (values.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
    throw new Error('Embedding contains non-finite values');
  }
  return `[${values.join(',')}]`;
}
