import type { DynamicFormField, DynamicFormSchema } from '../domain/public-api';
import { isDynamicFormFieldVisible } from './dynamic-form-visibility';

/** Normalizes a form model into the JSON object the API would receive. */
export function readDynamicFormValue(
  schema: DynamicFormSchema,
  raw: unknown,
): Record<string, unknown> {
  const source = asRecord(raw);
  return Object.fromEntries(
    visibleEntries(schema.sections.flatMap((section) => section.fields), source),
  );
}

function readField(field: DynamicFormField, value: unknown): unknown {
  switch (field.type) {
    case 'number':
      return readNumber(value);
    case 'date':
      return readDate(value);
    case 'checkbox':
      return value === true;
    case 'checkboxGroup':
      return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
    case 'group': {
      const source = asRecord(value);
      return Object.fromEntries(visibleEntries(field.fields, source));
    }
    case 'repeat':
      return readRepeat(field.fields, value);
    default:
      return typeof value === 'string' ? value : '';
  }
}

function readRepeat(fields: DynamicFormField[], value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((row) => {
    const source = asRecord(row);
    return Object.fromEntries(visibleEntries(fields, source));
  });
}

function visibleEntries(
  fields: DynamicFormField[],
  source: Record<string, unknown>,
): [string, unknown][] {
  return fields
    .filter((field) => isDynamicFormFieldVisible(field, source))
    .map((field) => [field.key, readField(field, source[field.key])]);
}

function readDate(value: unknown): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return '';
  }
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readNumber(value: unknown): number | null {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}
