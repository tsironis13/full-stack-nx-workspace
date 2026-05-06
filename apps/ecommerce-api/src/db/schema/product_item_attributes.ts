import { InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';

import { productItems } from './product-items';
import { attributes } from './attributes';
import { attributeValues } from './attribute_values';

export const productItemAttributes = pgTable(
  'product_item_attributes',
  {
    productItemId: integer('product_item_id').references(
      () => productItems.id,
      { onDelete: 'cascade' }
    ),
    attributeId: integer('attribute_id').references(() => attributes.id, {
      onDelete: 'cascade',
    }),
    attributeValueId: integer('attribute_value_id').references(
      () => attributeValues.id,
      { onDelete: 'cascade' }
    ),
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
