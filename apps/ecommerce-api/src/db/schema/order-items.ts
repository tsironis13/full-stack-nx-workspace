import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

import { orders } from './orders';
import { productItems } from './product-items';

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productItemId: integer('product_item_id')
    .notNull()
    .references(() => productItems.id),
  productName: text('product_name'),
  productCode: varchar('product_code'),
  salePrice: doublePrecision('sale_price').notNull(),
  originalPrice: doublePrecision('original_price').notNull(),
  quantity: integer('quantity').notNull(),
});

export type OrderItems = InferSelectModel<typeof orderItems>;
