import { effect, resource, untracked, type Injector } from '@angular/core';
import {
  applyEach,
  disabled,
  email,
  hidden,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  required,
  validate,
  validateAsync,
  type FieldTree,
  type SchemaPath,
  type SchemaPathTree,
} from '@angular/forms/signals';

import type {
  DynamicFormAsyncValidator,
  DynamicFormField,
  DynamicFormRepeatField,
  DynamicFormSchema,
  DynamicFormValidator,
} from '../application/public-api';

/**
 * Model built from a dynamic form schema.
 * Empty number and date inputs are `null`. A date is a `Date` while editing;
 * the submitted value is still a `YYYY-MM-DD` string.
 */
export interface DynamicFormModel {
  [key: string]: DynamicFormModelValue;
}

export type DynamicFormModelValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | DynamicFormModel
  | DynamicFormModel[]
  | null;

export function dynamicFormModel(schema: DynamicFormSchema): DynamicFormModel {
  return modelFor(schema.sections.flatMap((section) => section.fields));
}

export function applyDynamicFormSchema(
  path: SchemaPathTree<DynamicFormModel>,
  schema: DynamicFormSchema,
): void {
  applyFields(
    path,
    schema.sections.flatMap((section) => section.fields),
  );
}

export function dynamicFormRepeatRow(
  field: DynamicFormRepeatField,
): DynamicFormModel {
  return modelFor(field.fields);
}

/** Clears fields marked `resetOnHide` once they become hidden. */
export function bindDynamicFormResetOnHide(
  root: FieldTree<DynamicFormModel>,
  schema: DynamicFormSchema,
  injector: Injector,
): void {
  effect(
    () => {
      resetHiddenFields(
        root,
        schema.sections.flatMap((section) => section.fields),
      );
    },
    { injector },
  );
}

function modelFor(fields: DynamicFormField[]): DynamicFormModel {
  return Object.fromEntries(
    fields.map((field) => [field.key, initialValue(field)]),
  );
}

function initialValue(field: DynamicFormField): DynamicFormModelValue {
  switch (field.type) {
    case 'checkbox':
      return false;
    case 'checkboxGroup':
      return [];
    case 'number':
    case 'date':
      return null;
    case 'group':
      return modelFor(field.fields);
    case 'repeat':
      return [];
    default:
      return '';
  }
}

function resetHiddenFields(
  parent: FieldTree<DynamicFormModel>,
  fields: DynamicFormField[],
): void {
  for (const field of fields) {
    const node = parent[field.key] as FieldTree<DynamicFormModelValue>;
    if (field.resetOnHide && node().hidden()) {
      const empty = initialValue(field);
      const current = untracked(() => node().value());
      if (!sameModelValue(current, empty)) {
        node().reset(empty);
      }
    }
    if (field.type === 'group') {
      resetHiddenFields(node as FieldTree<DynamicFormModel>, field.fields);
    } else if (field.type === 'repeat') {
      const rows = node as FieldTree<DynamicFormModel[]>;
      rows().value();
      for (const row of [...rows] as FieldTree<DynamicFormModel>[]) {
        resetHiddenFields(row, field.fields);
      }
    }
  }
}

function sameModelValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => sameModelValue(item, right[index]))
    );
  }
  if (isRecord(left) && isRecord(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every((key) => sameModelValue(left[key], right[key]))
    );
  }
  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

function applyFields(
  path: SchemaPathTree<DynamicFormModel>,
  fields: DynamicFormField[],
): void {
  for (const field of fields) {
    const fieldPath = childPath(path, field.key);
    if (field.disabled) {
      disabled(fieldPath);
    }
    if (field.disabledWhen) {
      const when = field.disabledWhen;
      const target = childPath<string>(path, when.key);
      disabled(fieldPath, {
        when: ({ valueOf }) => valueOf(target) === when.equals,
      });
    }
    if (field.visibleWhen) {
      const when = field.visibleWhen;
      const target = childPath<string>(path, when.key);
      hidden(fieldPath, {
        when: ({ valueOf }) => valueOf(target) !== when.equals,
      });
    }
    applyRequiredWhen(path, field);
    switch (field.type) {
      case 'group':
        applyFields(groupPath(path, field.key), field.fields);
        break;
      case 'repeat':
        applyEach(childPath<DynamicFormModel[]>(path, field.key), (item) => {
          applyFields(item as SchemaPathTree<DynamicFormModel>, field.fields);
        });
        break;
      case 'number':
        applyNumberValidators(
          childPath<number | null>(path, field.key),
          field.validators,
        );
        break;
      case 'date':
        applyDateValidators(
          childPath<Date | null>(path, field.key),
          field.validators,
        );
        break;
      case 'checkbox':
        applyCheckboxValidators(
          childPath<boolean>(path, field.key),
          field.validators,
        );
        break;
      case 'checkboxGroup':
        applySelectionValidators(
          childPath<string[]>(path, field.key),
          field.validators,
        );
        break;
      default: {
        const stringPath = childPath<string>(path, field.key);
        applyStringValidators(path, stringPath, field.validators);
        if (isTextLike(field)) {
          applyAsyncValidators(stringPath, field.asyncValidators);
        }
        break;
      }
    }
  }
}

function childPath<T = unknown>(
  parent: SchemaPathTree<DynamicFormModel>,
  key: string,
): SchemaPath<T> {
  return parent[key] as SchemaPath<T>;
}

function groupPath(
  parent: SchemaPathTree<DynamicFormModel>,
  key: string,
): SchemaPathTree<DynamicFormModel> {
  return parent[key] as SchemaPathTree<DynamicFormModel>;
}

function applyRequiredWhen(
  parent: SchemaPathTree<DynamicFormModel>,
  field: DynamicFormField,
): void {
  if (
    field.type === 'group' ||
    field.type === 'repeat' ||
    !field.requiredWhen
  ) {
    return;
  }

  const when = field.requiredWhen;
  const target = childPath<string>(parent, when.key);
  const fieldPath = childPath(parent, field.key);
  required(fieldPath, {
    message: when.message,
    when: ({ valueOf }) => valueOf(target) === when.equals,
  });
  if (field.type === 'checkboxGroup') {
    validate(childPath<string[]>(parent, field.key), ({ value, valueOf }) =>
      valueOf(target) === when.equals && value().length === 0
        ? { kind: 'required', message: when.message }
        : undefined,
    );
  }
}

function applyStringValidators(
  parent: SchemaPathTree<DynamicFormModel>,
  path: SchemaPath<string>,
  validators: DynamicFormValidator[] | undefined,
): void {
  for (const validator of validators ?? []) {
    switch (validator.kind) {
      case 'required':
        required(path, { message: validator.message });
        break;
      case 'email':
        email(path, { message: validator.message });
        break;
      case 'minLength':
        minLength(path, validator.value, { message: validator.message });
        break;
      case 'maxLength':
        applyMaxLength(path, validator.value, validator.message);
        break;
      case 'pattern':
        pattern(path, new RegExp(validator.value), {
          message: validator.message,
        });
        break;
      case 'matches':
        applyMatches(parent, path, validator.field, validator.message);
        break;
      default:
        break;
    }
  }
}

function applyNumberValidators(
  path: SchemaPath<number | null>,
  validators: DynamicFormValidator[] | undefined,
): void {
  for (const validator of validators ?? []) {
    switch (validator.kind) {
      case 'required':
        required(path, { message: validator.message });
        break;
      case 'min':
        min(path, validator.value, { message: validator.message });
        break;
      case 'max':
        max(path, validator.value, { message: validator.message });
        break;
      default:
        break;
    }
  }
}

function applyDateValidators(
  path: SchemaPath<Date | null>,
  validators: DynamicFormValidator[] | undefined,
): void {
  for (const validator of validators ?? []) {
    if (validator.kind === 'required') {
      required(path, { message: validator.message });
    }
  }
}

function applyCheckboxValidators(
  path: SchemaPath<boolean>,
  validators: DynamicFormValidator[] | undefined,
): void {
  for (const validator of validators ?? []) {
    if (validator.kind === 'required') {
      required(path, { message: validator.message });
    }
  }
}

function applySelectionValidators(
  path: SchemaPath<string[]>,
  validators: DynamicFormValidator[] | undefined,
): void {
  for (const validator of validators ?? []) {
    switch (validator.kind) {
      case 'required':
        applyMinSelected(path, 1, validator.message);
        break;
      case 'minSelected':
        applyMinSelected(path, validator.value, validator.message);
        break;
      case 'minLength':
        minLength(path, validator.value, { message: validator.message });
        break;
      case 'maxLength':
        maxLength(path, validator.value, { message: validator.message });
        break;
      default:
        break;
    }
  }
}

function isTextLike(
  field: DynamicFormField,
): field is Extract<
  DynamicFormField,
  { type: 'text' | 'email' | 'tel' | 'textarea' }
> {
  return (
    field.type === 'text' ||
    field.type === 'email' ||
    field.type === 'tel' ||
    field.type === 'textarea'
  );
}

function applyAsyncValidators(
  path: SchemaPath<string>,
  validators: DynamicFormAsyncValidator[] | undefined,
): void {
  for (const validator of validators ?? []) {
    const blocked = new Set(validator.value.map((item) => item.toLowerCase()));
    validateAsync(path, {
      params: ({ value }) => value(),
      factory: (value) =>
        resource({
          params: value,
          loader: async ({ params }) =>
            params !== undefined && blocked.has(params.toLowerCase()),
        }),
      onSuccess: (taken) =>
        taken ? { kind: 'notOneOf', message: validator.message } : undefined,
      onError: () => ({ kind: 'notOneOf', message: validator.message }),
    });
  }
}

function applyMatches(
  parent: SchemaPathTree<DynamicFormModel>,
  path: SchemaPath<string>,
  fieldKey: string,
  message: string,
): void {
  const target = childPath<string>(parent, fieldKey);
  validate(path, ({ value, valueOf }) =>
    value() === valueOf(target) ? undefined : { kind: 'matches', message },
  );
}

function applyMaxLength(
  path: SchemaPath<string>,
  maximum: number,
  message: string,
): void {
  validate(path, ({ value }) =>
    value().length <= maximum ? undefined : { kind: 'maxLength', message },
  );
}

function applyMinSelected(
  path: SchemaPath<string[]>,
  minimum: number,
  message: string,
): void {
  validate(path, ({ value }) =>
    value().length >= minimum ? undefined : { kind: 'minSelected', message },
  );
}
