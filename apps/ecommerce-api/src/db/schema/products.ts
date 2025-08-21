import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

import { productCategories } from './product-categories';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name'),
  description: text('description'),
  careInstructions: text('care_instructions'),
  about: text('about'),
  categoryId: integer('category_id')
    .notNull()
    .references(() => productCategories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export type Products = InferSelectModel<typeof products>;
