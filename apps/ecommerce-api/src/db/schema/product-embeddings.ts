/**
 * One 1024D embedding row per Product, produced by Qwen3-Embedding-0.6B via
 * LM Studio. `content` is the exact document that was embedded.
 */
import { pgTable, integer, text, timestamp, vector } from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

import { products } from './products';

/** Qwen3-Embedding-0.6B output size (LM Studio: text-embedding-qwen3-embedding-0.6b). */
export const PRODUCT_EMBEDDING_DIMENSIONS = 1024;

export const productEmbeddings = pgTable('product_embeddings', {
  productId: integer('product_id')
    .primaryKey()
    .references(() => products.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  embedding: vector('embedding', {
    dimensions: PRODUCT_EMBEDDING_DIMENSIONS,
  }).notNull(),
  model: text('model').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type ProductEmbeddings = InferSelectModel<typeof productEmbeddings>;
