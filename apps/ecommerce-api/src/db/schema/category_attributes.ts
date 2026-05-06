import { InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';

import { productCategories } from './product-categories';
import { attributes } from './attributes';

export const categoryAttributes = pgTable(
  'category_attributes',
  {
    categoryId: integer('category_id').references(() => productCategories.id, {
      onDelete: 'cascade',
    }),
    attributeId: integer('attribute_id').references(() => attributes.id, {
      onDelete: 'cascade',
    }),
  },
  (table) => [primaryKey({ columns: [table.categoryId, table.attributeId] })]
);

export type CateogoryAttributes = InferSelectModel<typeof categoryAttributes>;
