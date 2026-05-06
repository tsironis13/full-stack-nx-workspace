import {
  pgTable,
  serial,
  timestamp,
  integer,
  vector,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

import { productCategories } from './product-categories';
import { products } from './products';

export const productEmbeddings = pgTable('product_embeddings', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => productCategories.id, { onDelete: 'cascade' }),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type ProductEmbeddings = InferSelectModel<typeof productEmbeddings>;
