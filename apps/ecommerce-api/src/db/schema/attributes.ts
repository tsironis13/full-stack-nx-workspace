import { InferSelectModel } from 'drizzle-orm';
import { pgEnum, pgTable, serial, text } from 'drizzle-orm/pg-core';

export const inputTypeEnum = pgEnum('input_type', ['radio', 'checkbox']);

export const attributes = pgTable('attributes', {
  id: serial('id').primaryKey(),
  name: text('name'),
  inputType: inputTypeEnum('input_type'),
});

export type Attributes = InferSelectModel<typeof attributes>;
