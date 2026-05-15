import {
  pgTable,
  serial,
  uuid,
  timestamp,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

export const carts = pgTable('carts', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Carts = InferSelectModel<typeof carts>;
