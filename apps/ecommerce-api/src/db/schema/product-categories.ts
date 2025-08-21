import { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  foreignKey,
} from 'drizzle-orm/pg-core';

export const productCategories = pgTable(
  'product_categories',
  {
    id: serial('id').primaryKey(),
    name: text('name'),
    description: text('description'),
    image_url: text('image_url'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
    parentCategoryId: integer('parent_category_id'),
  },
  (table) => [
    foreignKey({
      columns: [table.parentCategoryId],
      foreignColumns: [table.id],
      name: 'product_categories_parent_category_id_fkey',
    }),
  ]
);

export type ProductCategories = InferSelectModel<typeof productCategories>;
