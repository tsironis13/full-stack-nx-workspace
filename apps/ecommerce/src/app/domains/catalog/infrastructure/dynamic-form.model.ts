/** JSON body the catalog form endpoint is expected to return. */
export interface DynamicFormOptionWire {
  value: string;
  label: string;
}

export interface DynamicFormVisibilityWire {
  key: DynamicFormFieldBaseWire['key'];
  equals: string;
}

export interface DynamicFormRequiredWhenWire extends DynamicFormVisibilityWire {
  message: string;
}

export type DynamicFormUpdateOnWire = 'change' | 'blur' | 'submit';

export interface DynamicFormAsyncValidatorWire {
  kind: 'notOneOf';
  value: string[];
  message: string;
}

export type DynamicFormValidatorWire =
  | { kind: 'required'; message: string }
  | { kind: 'email'; message: string }
  | { kind: 'minLength'; value: number; message: string }
  | { kind: 'maxLength'; value: number; message: string }
  | { kind: 'min'; value: number; message: string }
  | { kind: 'max'; value: number; message: string }
  | { kind: 'pattern'; value: string; message: string }
  | { kind: 'minSelected'; value: number; message: string }
  | { kind: 'matches'; field: string; message: string };

interface DynamicFormFieldBaseWire {
  key: string;
  label: string;
  hint?: string;
  disabled?: boolean;
  visibleWhen?: DynamicFormVisibilityWire;
  disabledWhen?: DynamicFormVisibilityWire;
  resetOnHide?: boolean;
  validators?: DynamicFormValidatorWire[];
  asyncValidators?: DynamicFormAsyncValidatorWire[];
  updateOn?: DynamicFormUpdateOnWire;
  debounce?: number;
  requiredWhen?: DynamicFormRequiredWhenWire;
}

export interface DynamicFormTextFieldWire extends DynamicFormFieldBaseWire {
  type: 'text' | 'email' | 'tel';
  placeholder?: string;
}

export interface DynamicFormTextareaFieldWire extends DynamicFormFieldBaseWire {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
}

export interface DynamicFormNumberFieldWire extends DynamicFormFieldBaseWire {
  type: 'number';
  placeholder?: string;
  step?: number;
}

export interface DynamicFormDateFieldWire extends DynamicFormFieldBaseWire {
  type: 'date';
}

export interface DynamicFormSelectFieldWire extends DynamicFormFieldBaseWire {
  type: 'select';
  placeholder?: string;
  options: DynamicFormOptionWire[];
}

export interface DynamicFormRadioFieldWire extends DynamicFormFieldBaseWire {
  type: 'radio';
  options: DynamicFormOptionWire[];
}

export interface DynamicFormCheckboxFieldWire extends DynamicFormFieldBaseWire {
  type: 'checkbox';
}

export interface DynamicFormCheckboxGroupFieldWire extends DynamicFormFieldBaseWire {
  type: 'checkboxGroup';
  options: DynamicFormOptionWire[];
}

export interface DynamicFormGroupFieldWire extends DynamicFormFieldBaseWire {
  type: 'group';
  fields: DynamicFormFieldWire[];
}

export interface DynamicFormRepeatFieldWire extends DynamicFormFieldBaseWire {
  type: 'repeat';
  addLabel: string;
  removeLabel: string;
  fields: DynamicFormFieldWire[];
}

export type DynamicFormFieldWire =
  | DynamicFormTextFieldWire
  | DynamicFormTextareaFieldWire
  | DynamicFormNumberFieldWire
  | DynamicFormDateFieldWire
  | DynamicFormSelectFieldWire
  | DynamicFormRadioFieldWire
  | DynamicFormCheckboxFieldWire
  | DynamicFormCheckboxGroupFieldWire
  | DynamicFormGroupFieldWire
  | DynamicFormRepeatFieldWire;

export interface DynamicFormSectionWire {
  id: string;
  title: string;
  description?: string;
  fields: DynamicFormFieldWire[];
}

export interface DynamicFormSchemaWire {
  id: string;
  title: string;
  description?: string;
  submitLabel: string;
  sections: DynamicFormSectionWire[];
}
