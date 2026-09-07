import {
  pgTable,
  serial,
  doublePrecision,
  varchar,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { InferSelectModel, sql } from 'drizzle-orm';

import { products } from './products';

export const productItems = pgTable(
  'product_items',
  {
    id: serial('id').primaryKey(),
    sku: varchar('product_code'),
    originalPrice: doublePrecision('original_price'),
    salePrice: doublePrecision('sale_price'),
    isMainProduct: boolean('is_main_product').notNull().default(false),
    inventory: integer('inventory').notNull().default(0),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    {
      oneMainPerProduct: uniqueIndex('one_main_product_per_product')
        .on(table.productId)
        .where(sql`${table.isMainProduct} = true`),
    },
    check('chk_product_items_inventory_non_negative', sql`${table.inventory} >= 0`),
  ]
);

export type ProductItems = InferSelectModel<typeof productItems>;
