import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormField, type FieldTree } from '@angular/forms/signals';
import { WrButton } from 'ngwr/button';
import { WrDatePicker } from 'ngwr/date-picker';
import { WrCheckbox, WrCheckboxGroup } from 'ngwr/checkbox';
import { WrFormError, WrFormField, WrFormItem } from 'ngwr/form';
import { WrInput } from 'ngwr/input';
import { WrInputNumber } from 'ngwr/input-number';
import { WrRadio, WrRadioGroup } from 'ngwr/radio';
import { WrOption, WrSelect } from 'ngwr/select';
import { WrTextarea } from 'ngwr/textarea';

import type {
  DynamicFormField,
  DynamicFormRepeatField,
} from '../application/public-api';
import {
  dynamicFormRepeatRow,
  type DynamicFormModel,
  type DynamicFormModelValue,
} from './build-dynamic-signal-form';
import { dynamicSignalFieldViews } from './dynamic-signal-field-view';

@Component({
  selector: 'app-dynamic-signal-form-fields',
  templateUrl: './dynamic-signal-form-fields.component.html',
  styleUrl: './dynamic-signal-form-fields.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DynamicSignalFormFieldsComponent,
    FormField,
    WrButton,
    WrCheckbox,
    WrCheckboxGroup,
    WrDatePicker,
    WrFormError,
    WrFormField,
    WrFormItem,
    WrInput,
    WrInputNumber,
    WrOption,
    WrRadio,
    WrRadioGroup,
    WrSelect,
    WrTextarea,
  ],
})
export class DynamicSignalFormFieldsComponent {
  readonly parent = input.required<FieldTree<DynamicFormModel>>();
  readonly fields = input.required<DynamicFormField[]>();
  readonly submitted = input(false);
  readonly namePrefix = input('');

  protected readonly views = computed(() => {
    return dynamicSignalFieldViews(
      this.parent(),
      this.fields(),
      this.namePrefix(),
      this.submitted(),
    );
  });

  protected addRow(field: DynamicFormRepeatField): void {
    const rows = this.repeatField(field.key);
    if (rows().disabled()) {
      return;
    }
    rows().value.update((current) => [...current, dynamicFormRepeatRow(field)]);
  }

  protected removeRow(field: DynamicFormRepeatField, index: number): void {
    const rows = this.repeatField(field.key);
    if (rows().disabled()) {
      return;
    }
    rows().value.update((current) =>
      current.filter((_, rowIndex) => rowIndex !== index),
    );
  }

  private leaf(key: string): FieldTree<DynamicFormModelValue> {
    return this.parent()[key] as FieldTree<DynamicFormModelValue>;
  }

  private repeatField(key: string): FieldTree<DynamicFormModel[]> {
    return this.leaf(key) as FieldTree<DynamicFormModel[]>;
  }
}
