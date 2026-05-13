import {
  pgTable,
  serial,
  uuid,
  text,
  varchar,
  doublePrecision,
  timestamp,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id'),
  guestEmail: text('guest_email'),
  status: text('status').notNull().default('confirmed'),
  shippingAddress: varchar('shipping_address').notNull(),
  paymentStatus: text('payment_status').notNull().default('pending'),
  totalAmount: doublePrecision('total_amount'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Orders = InferSelectModel<typeof orders>;
