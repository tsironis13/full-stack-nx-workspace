import {
  index,
  integer,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { InferSelectModel } from 'drizzle-orm';

import { products } from './products';

export const productReviews = pgTable(
  'product_reviews',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    userId: uuid('user_id').notNull(),
    rating: smallint('rating').notNull(),
    title: text('title'),
    body: text('body'),
    authorDisplayName: text('author_display_name').notNull(),
    hiddenAt: timestamp('hidden_at'),
    hiddenBy: text('hidden_by'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [
    uniqueIndex('one_review_per_user_per_product').on(t.productId, t.userId),
    index('product_reviews_product_id_visible_idx')
      .on(t.productId)
      .where(sql`${t.hiddenAt} is null`),
  ],
);

export type ProductReview = InferSelectModel<typeof productReviews>;
