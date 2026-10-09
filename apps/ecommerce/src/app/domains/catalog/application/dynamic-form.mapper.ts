import type {
  DynamicFormField,
  DynamicFormSchema,
  DynamicFormSection,
  DynamicFormValidator,
} from '../domain/public-api';
import type {
  DynamicFormFieldWire,
  DynamicFormSchemaWire,
  DynamicFormSectionWire,
  DynamicFormValidatorWire,
} from '../infrastructure/public-api';

export function mapDynamicFormSchemaFromWire(
  wire: DynamicFormSchemaWire,
): DynamicFormSchema {
  return {
    id: wire.id,
    title: wire.title,
    description: wire.description,
    submitLabel: wire.submitLabel,
    sections: wire.sections.map(mapSection),
  };
}

function mapSection(section: DynamicFormSectionWire): DynamicFormSection {
  return {
    id: section.id,
    title: section.title,
    description: section.description,
    fields: section.fields.map(mapField),
  };
}

function mapField(field: DynamicFormFieldWire): DynamicFormField {
  if (field.type === 'group') {
    return {
      key: field.key,
      type: 'group',
      label: field.label,
      hint: field.hint,
      disabled: field.disabled,
      visibleWhen: field.visibleWhen,
      disabledWhen: field.disabledWhen,
      resetOnHide: field.resetOnHide,
      fields: field.fields.map(mapField),
    };
  }

  if (field.type === 'repeat') {
    return {
      key: field.key,
      type: 'repeat',
      label: field.label,
      hint: field.hint,
      disabled: field.disabled,
      visibleWhen: field.visibleWhen,
      disabledWhen: field.disabledWhen,
      resetOnHide: field.resetOnHide,
      addLabel: field.addLabel,
      removeLabel: field.removeLabel,
      fields: field.fields.map(mapField),
    };
  }

  return {
    ...field,
    validators: field.validators?.map(mapValidator),
  };
}

function mapValidator(validator: DynamicFormValidatorWire): DynamicFormValidator {
  switch (validator.kind) {
    case 'required':
    case 'email':
      return { kind: validator.kind, message: validator.message };
    case 'pattern':
      return {
        kind: 'pattern',
        value: validator.value,
        message: validator.message,
      };
    case 'minLength':
    case 'maxLength':
    case 'min':
    case 'max':
    case 'minSelected':
      return {
        kind: validator.kind,
        value: validator.value,
        message: validator.message,
      };
    case 'matches':
      return {
        kind: 'matches',
        field: validator.field,
        message: validator.message,
      };
  }
}
