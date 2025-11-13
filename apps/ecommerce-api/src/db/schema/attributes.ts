import { InferSelectModel } from 'drizzle-orm';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const attributes = pgTable('attributes', {
  id: serial('id').primaryKey(),
  name: text('name'),
});

export type Attributes = InferSelectModel<typeof attributes>;
