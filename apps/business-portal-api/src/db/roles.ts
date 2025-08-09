import { InferSelectModel } from 'drizzle-orm';
import { pgTable, bigserial, text, boolean } from 'drizzle-orm/pg-core';

export const roles = pgTable('roles', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull(),
  isInternal: boolean('isInternal').default(false),
});

export type Roles = InferSelectModel<typeof roles>;
