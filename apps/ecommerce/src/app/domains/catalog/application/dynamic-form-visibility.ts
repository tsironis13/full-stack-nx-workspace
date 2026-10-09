import type { DynamicFormField, DynamicFormVisibility } from '../domain/public-api';

/** True while a sibling select or radio equals the given option. */
export function isDynamicFormConditionMet(
  when: DynamicFormVisibility | undefined,
  siblings: Record<string, unknown>,
): boolean {
  return !!when && siblings[when.key] === when.equals;
}

/** A field with no `visibleWhen` is always shown. */
export function isDynamicFormFieldVisible(
  field: DynamicFormField,
  siblings: Record<string, unknown>,
): boolean {
  if (!field.visibleWhen) {
    return true;
  }
  return isDynamicFormConditionMet(field.visibleWhen, siblings);
}
