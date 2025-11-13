import { InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';

export const productItemAttributes = pgTable(
  'product_item_attributes',
  {
    productItemId: integer('product_item_id'),
    attributeId: integer('attribute_id'),
    attributeValueId: integer('attribute_value_id'),
  },
  (table) => [
    primaryKey({
      columns: [table.productItemId, table.attributeValueId, table.attributeId],
    }),
  ]
);

export type ProductItemAttributes = InferSelectModel<
  typeof productItemAttributes
>;
