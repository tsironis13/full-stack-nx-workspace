import { InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';

export const categoryAttributes = pgTable(
  'category_attributes',
  {
    categoryId: integer('category_id'),
    attributeId: integer('attribute_id'),
  },
  (table) => [primaryKey({ columns: [table.categoryId, table.attributeId] })]
);

export type CateogoryAttributes = InferSelectModel<typeof categoryAttributes>;
