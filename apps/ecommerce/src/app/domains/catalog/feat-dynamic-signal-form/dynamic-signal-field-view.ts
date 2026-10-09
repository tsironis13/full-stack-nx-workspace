import type { FieldTree } from '@angular/forms/signals';

import type {
  DynamicFormCheckboxField,
  DynamicFormCheckboxGroupField,
  DynamicFormDateField,
  DynamicFormField,
  DynamicFormGroupField,
  DynamicFormNumberField,
  DynamicFormRadioField,
  DynamicFormRepeatField,
  DynamicFormSelectField,
  DynamicFormTextareaField,
  DynamicFormTextField,
} from '../application/public-api';
import type {
  DynamicFormModel,
  DynamicFormModelValue,
} from './build-dynamic-signal-form';

interface DynamicSignalVisibleView {
  key: string;
  hidden: false;
  controlId: string;
}

interface DynamicSignalLeafView {
  label: string;
  required: boolean;
  error: string | null;
  errorId: string | null;
  disabled: boolean;
}

interface DynamicSignalHiddenFieldView {
  key: string;
  hidden: true;
}

type DynamicSignalGroupFieldView = DynamicSignalVisibleView & {
  kind: 'group';
  field: DynamicFormGroupField;
  group: FieldTree<DynamicFormModel>;
};

interface DynamicSignalRepeatRowView {
  controlId: string;
  group: FieldTree<DynamicFormModel>;
}

type DynamicSignalRepeatFieldView = DynamicSignalVisibleView & {
  kind: 'repeat';
  field: DynamicFormRepeatField;
  rows: readonly DynamicSignalRepeatRowView[];
  disabled: boolean;
};

type DynamicSignalCheckboxFieldView = DynamicSignalVisibleView &
  DynamicSignalLeafView & {
    kind: 'checkbox';
    field: DynamicFormCheckboxField;
    control: FieldTree<boolean>;
  };

type DynamicSignalCheckboxGroupFieldView = DynamicSignalVisibleView &
  DynamicSignalLeafView & {
    kind: 'checkboxGroup';
    field: DynamicFormCheckboxGroupField;
    control: FieldTree<string[]>;
  };

type DynamicSignalRadioFieldView = DynamicSignalVisibleView &
  DynamicSignalLeafView & {
    kind: 'radio';
    field: DynamicFormRadioField;
    control: FieldTree<string>;
  };

type DynamicSignalSelectFieldView = DynamicSignalVisibleView &
  DynamicSignalLeafView & {
    kind: 'select';
    field: DynamicFormSelectField;
    control: FieldTree<string>;
  };

type DynamicSignalTextareaFieldView = DynamicSignalVisibleView &
  DynamicSignalLeafView & {
    kind: 'textarea';
    field: DynamicFormTextareaField;
    control: FieldTree<string>;
  };

type DynamicSignalNumberFieldView = DynamicSignalVisibleView &
  DynamicSignalLeafView & {
    kind: 'number';
    field: DynamicFormNumberField;
    control: FieldTree<number | null>;
  };

type DynamicSignalDateFieldView = DynamicSignalVisibleView &
  DynamicSignalLeafView & {
    kind: 'date';
    field: DynamicFormDateField;
    control: FieldTree<Date | null>;
  };

type DynamicSignalTextInputFieldView = DynamicSignalVisibleView &
  DynamicSignalLeafView & {
    kind: 'text' | 'email' | 'tel';
    field: DynamicFormTextField;
    control: FieldTree<string>;
  };

type DynamicSignalFieldView =
  | DynamicSignalHiddenFieldView
  | DynamicSignalGroupFieldView
  | DynamicSignalRepeatFieldView
  | DynamicSignalCheckboxFieldView
  | DynamicSignalCheckboxGroupFieldView
  | DynamicSignalRadioFieldView
  | DynamicSignalSelectFieldView
  | DynamicSignalTextareaFieldView
  | DynamicSignalNumberFieldView
  | DynamicSignalDateFieldView
  | DynamicSignalTextInputFieldView;

/** Projects schema fields and their signal-form state into render models. */
export function dynamicSignalFieldViews(
  parent: FieldTree<DynamicFormModel>,
  fields: readonly DynamicFormField[],
  namePrefix: string,
  submitted: boolean,
): DynamicSignalFieldView[] {
  return fields.map((field) =>
    dynamicSignalFieldView(parent, field, namePrefix, submitted),
  );
}

function dynamicSignalFieldView(
  parent: FieldTree<DynamicFormModel>,
  field: DynamicFormField,
  namePrefix: string,
  submitted: boolean,
): DynamicSignalFieldView {
  const tree = childTree(parent, field.key);
  if (tree().hidden()) {
    return { key: field.key, hidden: true };
  }

  const controlId = namePrefix ? `${namePrefix}.${field.key}` : field.key;
  switch (field.type) {
    case 'group':
      return {
        key: field.key,
        hidden: false,
        kind: 'group',
        controlId,
        field,
        group: tree as FieldTree<DynamicFormModel>,
      };
    case 'repeat':
      return repeatView(
        field,
        tree as FieldTree<DynamicFormModel[]>,
        controlId,
      );
    case 'checkbox':
      return {
        ...leafView(field, tree, controlId, submitted),
        kind: 'checkbox',
        field,
        control: tree as FieldTree<boolean>,
      };
    case 'checkboxGroup':
      return checkboxGroupView(
        field,
        tree as FieldTree<string[]>,
        controlId,
        submitted,
      );
    case 'radio':
      return {
        ...leafView(field, tree, controlId, submitted),
        kind: 'radio',
        field,
        control: tree as FieldTree<string>,
      };
    case 'select':
      return {
        ...leafView(field, tree, controlId, submitted),
        kind: 'select',
        field,
        control: tree as FieldTree<string>,
      };
    case 'textarea':
      return {
        ...leafView(field, tree, controlId, submitted),
        kind: 'textarea',
        field,
        control: tree as FieldTree<string>,
      };
    case 'number':
      return {
        ...leafView(field, tree, controlId, submitted),
        kind: 'number',
        field,
        control: tree as FieldTree<number | null>,
      };
    case 'date':
      return {
        ...leafView(field, tree, controlId, submitted),
        kind: 'date',
        field,
        control: tree as FieldTree<Date | null>,
      };
    case 'text':
    case 'email':
    case 'tel':
      return {
        ...leafView(field, tree, controlId, submitted),
        kind: field.type,
        field,
        control: tree as FieldTree<string>,
      };
    default: {
      const unreachable: never = field;
      return unreachable;
    }
  }
}

function repeatView(
  field: DynamicFormRepeatField,
  tree: FieldTree<DynamicFormModel[]>,
  controlId: string,
): DynamicSignalRepeatFieldView {
  const state = tree();
  // Subscribe to the row list. Adding or removing a row updates this view.
  state.value();
  return {
    key: field.key,
    hidden: false,
    kind: 'repeat',
    controlId,
    field,
    disabled: state.disabled(),
    rows: [...tree].map((group, index) => ({
      controlId: `${controlId}.${index}`,
      group: group as FieldTree<DynamicFormModel>,
    })),
  };
}

function checkboxGroupView(
  field: DynamicFormCheckboxGroupField,
  tree: FieldTree<string[]>,
  controlId: string,
  submitted: boolean,
): DynamicSignalCheckboxGroupFieldView {
  return {
    ...leafView(field, tree, controlId, submitted),
    kind: 'checkboxGroup',
    field,
    control: tree,
  };
}

function leafView(
  field: DynamicFormField,
  tree: FieldTree<DynamicFormModelValue>,
  controlId: string,
  submitted: boolean,
): DynamicSignalVisibleView & DynamicSignalLeafView {
  const state = tree();
  const required = isMarkedRequired(field, state.required());
  const error = visibleError(
    state.errors(),
    state.disabled(),
    state.touched(),
    submitted,
  );
  return {
    key: field.key,
    hidden: false,
    controlId,
    label: required ? `${field.label} *` : field.label,
    required,
    error,
    errorId: error ? `${controlId}-error` : null,
    disabled: state.disabled(),
  };
}

function childTree(
  parent: FieldTree<DynamicFormModel>,
  key: string,
): FieldTree<DynamicFormModelValue> {
  return parent[key] as FieldTree<DynamicFormModelValue>;
}

/** `required()` covers schema `required` and `requiredWhen`. `minSelected` does not. */
function isMarkedRequired(field: DynamicFormField, required: boolean): boolean {
  return (
    required ||
    (field.validators?.some((validator) => validator.kind === 'minSelected') ??
      false)
  );
}

function visibleError(
  errors: readonly { kind: string; message?: string }[],
  disabled: boolean,
  touched: boolean,
  submitted: boolean,
): string | null {
  const message = errors[0]?.message ?? null;
  if (!message || disabled) {
    return null;
  }
  const showWhileEditing = errors.some(
    (error) => error.kind === 'maxLength' || error.kind === 'notOneOf',
  );
  if (!submitted && !touched && !showWhileEditing) {
    return null;
  }
  return message;
}
