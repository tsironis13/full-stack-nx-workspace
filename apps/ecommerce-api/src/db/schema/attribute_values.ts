import { InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';

import { attributes } from './attributes';

export const attributeValues = pgTable('attribute_values', {
  id: serial('id').primaryKey(),
  value: text('value'),
  attributeId: integer('attribute_id')
    .notNull()
    .references(() => attributes.id, { onDelete: 'cascade' }),
});

export type AttributeValues = InferSelectModel<typeof attributeValues>;
