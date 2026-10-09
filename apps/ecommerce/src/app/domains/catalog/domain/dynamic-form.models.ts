/**
 * Form definition the catalog API returns so the storefront can build a form.
 *
 * Section membership is layout only: top-level fields share one form group.
 * `key` values are unique among fields that share a parent (the form, or a group).
 * A key is the property name on the model the caller supplies. The schema does not
 * carry field values. A missing key starts empty.
 * `visibleWhen` names a sibling in that same parent. The field is shown only while
 * that sibling's value equals the given option. A hidden field keeps its value,
 * unless `resetOnHide` is true.
 * Keys and ids start with a letter and may contain letters, digits, and hyphens.
 * Dots are reserved for nested paths.
 * Labels, hints, option labels, and validator messages are display copy from the API.
 */
export interface DynamicFormOption {
  value: string;
  label: string;
}

/** Show or disable a field while a sibling select or radio equals `equals`. */
export interface DynamicFormVisibility {
  key: string;
  equals: string;
}

/** Require a field while a sibling select or radio equals `equals`. */
export interface DynamicFormRequiredWhen extends DynamicFormVisibility {
  message: string;
}

export type DynamicFormUpdateOn = 'change' | 'blur' | 'submit';

/** Async check. `notOneOf` fails when the value is one of `value`, ignoring case. */
export interface DynamicFormAsyncValidator {
  kind: 'notOneOf';
  value: string[];
  message: string;
}

export type DynamicFormValidator =
  | { kind: 'required'; message: string }
  | { kind: 'email'; message: string }
  | { kind: 'minLength'; value: number; message: string }
  | { kind: 'maxLength'; value: number; message: string }
  | { kind: 'min'; value: number; message: string }
  | { kind: 'max'; value: number; message: string }
  | { kind: 'pattern'; value: string; message: string }
  | { kind: 'minSelected'; value: number; message: string }
  | { kind: 'matches'; field: string; message: string };

interface DynamicFormFieldBase {
  key: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  validators?: DynamicFormValidator[];
  asyncValidators?: DynamicFormAsyncValidator[];
  visibleWhen?: DynamicFormVisibility;
  /** Disable the field while a sibling select or radio equals `equals`. */
  disabledWhen?: DynamicFormVisibility;
  /** When true, a hidden field's value is cleared. Omitted keeps the value. */
  resetOnHide?: boolean;
  /** When the control value is written. Omitted means `change`. */
  updateOn?: DynamicFormUpdateOn;
  /** Milliseconds to wait before writing the model. */
  debounce?: number;
  /** Require the field while a sibling select or radio equals `equals`. */
  requiredWhen?: DynamicFormRequiredWhen;
}

export interface DynamicFormTextField extends DynamicFormFieldBase {
  type: 'text' | 'email' | 'tel';
  placeholder?: string;
}

export interface DynamicFormTextareaField extends DynamicFormFieldBase {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
}

export interface DynamicFormNumberField extends DynamicFormFieldBase {
  type: 'number';
  placeholder?: string;
  step?: number;
}

export interface DynamicFormDateField extends DynamicFormFieldBase {
  type: 'date';
}

export interface DynamicFormSelectField extends DynamicFormFieldBase {
  type: 'select';
  placeholder?: string;
  options: DynamicFormOption[];
}

export interface DynamicFormRadioField extends DynamicFormFieldBase {
  type: 'radio';
  options: DynamicFormOption[];
}

export interface DynamicFormCheckboxField extends DynamicFormFieldBase {
  type: 'checkbox';
}

export interface DynamicFormCheckboxGroupField extends DynamicFormFieldBase {
  type: 'checkboxGroup';
  options: DynamicFormOption[];
}

/**
 * Values for a form, keyed by field `key`.
 * A group is a nested object. A repeat is an array of objects.
 */
export interface DynamicFormModel {
  [key: string]: DynamicFormModelValue;
}

export type DynamicFormModelValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | DynamicFormModel
  | DynamicFormModel[];

/** Nested object. Children may themselves be groups. */
export interface DynamicFormGroupField extends DynamicFormFieldBase {
  type: 'group';
  fields: DynamicFormField[];
}

/** Repeating rows. Each row is an object built from `fields`. */
export interface DynamicFormRepeatField extends DynamicFormFieldBase {
  type: 'repeat';
  addLabel: string;
  removeLabel: string;
  fields: DynamicFormField[];
}

export type DynamicFormField =
  | DynamicFormTextField
  | DynamicFormTextareaField
  | DynamicFormNumberField
  | DynamicFormDateField
  | DynamicFormSelectField
  | DynamicFormRadioField
  | DynamicFormCheckboxField
  | DynamicFormCheckboxGroupField
  | DynamicFormGroupField
  | DynamicFormRepeatField;

export interface DynamicFormSection {
  id: string;
  title: string;
  description?: string;
  fields: DynamicFormField[];
}

export interface DynamicFormSchema {
  id: string;
  title: string;
  description?: string;
  submitLabel: string;
  sections: DynamicFormSection[];
}
