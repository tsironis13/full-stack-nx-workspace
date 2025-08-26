import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

import { productItems } from './product-items';

export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  url: varchar('url'),
  productItemId: integer('product_item_id')
    .notNull()
    .references(() => productItems.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export type ProductImages = InferSelectModel<typeof productImages>;
