import {
  pgTable,
  serial,
  integer,
  doublePrecision,
  text,
  timestamp,
  unique,
  check,
} from 'drizzle-orm/pg-core';
import { InferSelectModel, sql } from 'drizzle-orm';

import { carts } from './carts';
import { productItems } from './product-items';

export const cartItems = pgTable(
  'cart_items',
  {
    id: serial('id').primaryKey(),
    cartId: integer('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productItemId: integer('product_item_id')
      .notNull()
      .references(() => productItems.id),
    quantity: integer('quantity').notNull(),
    capturedSalePrice: doublePrecision('captured_sale_price').notNull(),
    capturedName: text('captured_name').notNull(),
    capturedImageUrl: text('captured_image_url'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    unique('uq_cart_items_cart_product').on(table.cartId, table.productItemId),
    check('chk_cart_items_quantity_positive', sql`${table.quantity} > 0`),
  ],
);

export type CartItems = InferSelectModel<typeof cartItems>;
