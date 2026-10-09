import { ApplicationRef, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, type FieldTree } from '@angular/forms/signals';

import type { DynamicFormSchema } from '../application/public-api';
import { readDynamicFormValue } from '../application/public-api';
import {
  applyDynamicFormSchema,
  bindDynamicFormResetOnHide,
  dynamicFormModel,
  type DynamicFormModel,
} from './build-dynamic-signal-form';

const schema: DynamicFormSchema = {
  id: 'customOrderRequest',
  title: 'Custom order request',
  submitLabel: 'Submit request',
  sections: [
    {
      id: 'contact',
      title: 'Contact',
      fields: [
        {
          key: 'fullName',
          type: 'text',
          label: 'Full name',
          validators: [
            { kind: 'required', message: 'Full name is required.' },
            { kind: 'minLength', value: 2, message: 'Enter at least 2 characters.' },
            { kind: 'maxLength', value: 80, message: 'Use at most 80 characters.' },
          ],
        },
        {
          key: 'giftWrap',
          type: 'checkbox',
          label: 'Gift wrap',
          validators: [{ kind: 'required', message: 'Gift wrap must be accepted.' }],
        },
        {
          key: 'contactChannels',
          type: 'checkboxGroup',
          label: 'Contact preferences',
          options: [
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' },
          ],
          validators: [
            { kind: 'minSelected', value: 1, message: 'Choose at least one.' },
          ],
        },
        {
          key: 'referenceCode',
          type: 'text',
          label: 'Reference code',
          disabled: true,
        },
        {
          key: 'quantity',
          type: 'number',
          label: 'Quantity',
          validators: [
            { kind: 'min', value: 1, message: 'Quantity must be at least 1.' },
          ],
        },
        {
          key: 'deliveryAddress',
          type: 'group',
          label: 'Delivery address',
          fields: [
            {
              key: 'city',
              type: 'text',
              label: 'City',
              validators: [{ kind: 'required', message: 'City is required.' }],
            },
          ],
        },
      ],
    },
  ],
};

describe('buildDynamicSignalForm', () => {
  function createForm(): {
    model: ReturnType<typeof signal<DynamicFormModel>>;
    root: FieldTree<DynamicFormModel>;
  } {
    const injector = TestBed.inject(Injector);
    const model = signal({
      ...dynamicFormModel(schema),
      referenceCode: 'REQ-2048',
    });
    const root = form(model, (path) => applyDynamicFormSchema(path, schema), {
      injector,
    });
    return { model, root };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('applies schema validators, including checkbox required and minSelected', () => {
    const { root } = createForm();

    expect(root['fullName']().errors()[0]?.message).toBe('Full name is required.');
    root['fullName']().value.set('A');
    expect(root['fullName']().errors().some((error) => error.kind === 'minLength')).toBe(
      true,
    );
    root['fullName']().value.set('A'.repeat(81));
    expect(root['fullName']().errors()[0]?.message).toBe('Use at most 80 characters.');
    root['fullName']().value.set('A'.repeat(80));
    expect(root['fullName']().valid()).toBe(true);

    expect(root['giftWrap']().errors()[0]?.message).toBe('Gift wrap must be accepted.');
    root['giftWrap']().value.set(true);
    expect(root['giftWrap']().valid()).toBe(true);

    expect(root['contactChannels']().errors()[0]?.message).toBe('Choose at least one.');
    root['contactChannels']().value.set(['email']);
    expect(root['contactChannels']().valid()).toBe(true);
  });

  it('keeps disabled values in the model and nests groups', () => {
    const { model, root } = createForm();
    const address = root['deliveryAddress'] as FieldTree<DynamicFormModel>;

    root['fullName']().value.set('Ada');
    root['giftWrap']().value.set(true);
    root['contactChannels']().value.set(['sms']);
    root['quantity']().value.set(3);
    address['city']().value.set('Athens');

    expect(root['referenceCode']().disabled()).toBe(true);
    expect(root['referenceCode']().value()).toBe('REQ-2048');
    expect(readDynamicFormValue(schema, model())).toEqual({
      fullName: 'Ada',
      giftWrap: true,
      contactChannels: ['sms'],
      referenceCode: 'REQ-2048',
      quantity: 3,
      deliveryAddress: { city: 'Athens' },
    });
  });

  it('hides a group until the sibling selection matches and omits it from the payload', () => {
    const conditional: DynamicFormSchema = {
      id: 'customOrderRequest',
      title: 'Custom order request',
      submitLabel: 'Submit request',
      sections: [
        {
          id: 'request',
          title: 'Request',
          fields: [
            {
              key: 'fullName',
              type: 'text',
              label: 'Full name',
              validators: [{ kind: 'required', message: 'Full name is required.' }],
            },
            {
              key: 'fulfillment',
              type: 'radio',
              label: 'Fulfillment',
              options: [
                { value: 'delivery', label: 'Delivery' },
                { value: 'pickup', label: 'Store pickup' },
              ],
            },
            {
              key: 'deliveryAddress',
              type: 'group',
              label: 'Delivery address',
              visibleWhen: { key: 'fulfillment', equals: 'delivery' },
              fields: [
                {
                  key: 'city',
                  type: 'text',
                  label: 'City',
                  validators: [{ kind: 'required', message: 'City is required.' }],
                },
              ],
            },
          ],
        },
      ],
    };
    const injector = TestBed.inject(Injector);
    const model = signal(dynamicFormModel(conditional));
    const root = form(model, (path) => applyDynamicFormSchema(path, conditional), {
      injector,
    });
    const address = root['deliveryAddress'] as FieldTree<DynamicFormModel>;

    root['fullName']().value.set('Ada');
    address['city']().value.set('Athens');

    expect(address().hidden()).toBe(true);
    expect(root().valid()).toBe(true);
    expect(readDynamicFormValue(conditional, model())).toEqual({
      fullName: 'Ada',
      fulfillment: '',
    });

    root['fulfillment']().value.set('delivery');

    expect(address().hidden()).toBe(false);
    expect(address['city']().value()).toBe('Athens');
    expect(root().valid()).toBe(true);
    expect(readDynamicFormValue(conditional, model())).toEqual({
      fullName: 'Ada',
      fulfillment: 'delivery',
      deliveryAddress: { city: 'Athens' },
    });

    root['fulfillment']().value.set('pickup');

    expect(address().hidden()).toBe(true);
    expect(address['city']().value()).toBe('Athens');
    expect(root().valid()).toBe(true);
    expect(readDynamicFormValue(conditional, model())).toEqual({
      fullName: 'Ada',
      fulfillment: 'pickup',
    });
  });

  it('clears a hidden group and its fields when resetOnHide is set', () => {
    const conditional: DynamicFormSchema = {
      id: 'customOrderRequest',
      title: 'Custom order request',
      submitLabel: 'Submit request',
      sections: [
        {
          id: 'request',
          title: 'Request',
          fields: [
            {
              key: 'fulfillment',
              type: 'radio',
              label: 'Fulfillment',
              options: [
                { value: 'delivery', label: 'Delivery' },
                { value: 'pickup', label: 'Store pickup' },
              ],
            },
            {
              key: 'deliveryAddress',
              type: 'group',
              label: 'Delivery address',
              visibleWhen: { key: 'fulfillment', equals: 'delivery' },
              resetOnHide: true,
              fields: [
                {
                  key: 'street',
                  type: 'text',
                  label: 'Street',
                  validators: [{ kind: 'required', message: 'Street is required.' }],
                },
                {
                  key: 'city',
                  type: 'text',
                  label: 'City',
                  validators: [{ kind: 'required', message: 'City is required.' }],
                },
                {
                  key: 'postalCode',
                  type: 'text',
                  label: 'Postal code',
                  validators: [
                    { kind: 'required', message: 'Postal code is required.' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const injector = TestBed.inject(Injector);
    const model = signal(dynamicFormModel(conditional));
    const root = form(model, (path) => applyDynamicFormSchema(path, conditional), {
      injector,
    });
    bindDynamicFormResetOnHide(root, conditional, injector);
    const address = root['deliveryAddress'] as FieldTree<DynamicFormModel>;

    root['fulfillment']().value.set('delivery');
    address['street']().value.set('Ermou');
    address['city']().value.set('Athens');
    address['postalCode']().value.set('10563');
    TestBed.flushEffects();

    expect(address().hidden()).toBe(false);
    expect(address['street']().value()).toBe('Ermou');

    root['fulfillment']().value.set('pickup');
    TestBed.flushEffects();

    expect(address().hidden()).toBe(true);
    expect(address['street']().value()).toBe('');
    expect(address['city']().value()).toBe('');
    expect(address['postalCode']().value()).toBe('');
    expect(model()['deliveryAddress']).toEqual({
      street: '',
      city: '',
      postalCode: '',
    });
    expect(readDynamicFormValue(conditional, model())).toEqual({
      fulfillment: 'pickup',
    });

    root['fulfillment']().value.set('delivery');
    TestBed.flushEffects();

    expect(address().hidden()).toBe(false);
    expect(address['street']().value()).toBe('');
    expect(address['city']().value()).toBe('');
    expect(address['postalCode']().value()).toBe('');
    expect(address['city']().valid()).toBe(false);
  });

  it('requires a field while a sibling in another section matches requiredWhen', () => {
    const conditional: DynamicFormSchema = {
      id: 'customOrderRequest',
      title: 'Custom order request',
      submitLabel: 'Submit request',
      sections: [
        {
          id: 'contact',
          title: 'Contact',
          fields: [
            {
              key: 'phone',
              type: 'tel',
              label: 'Phone',
              requiredWhen: {
                key: 'fulfillment',
                equals: 'pickup',
                message: 'Phone is required for store pickup.',
              },
              validators: [
                {
                  kind: 'pattern',
                  value: '^\\+?[0-9 ()-]{6,20}$',
                  message: 'Enter a valid phone number.',
                },
              ],
            },
          ],
        },
        {
          id: 'request',
          title: 'Request',
          fields: [
            {
              key: 'fulfillment',
              type: 'radio',
              label: 'Fulfillment',
              options: [
                { value: 'delivery', label: 'Delivery' },
                { value: 'pickup', label: 'Store pickup' },
              ],
            },
          ],
        },
      ],
    };
    const injector = TestBed.inject(Injector);
    const model = signal(dynamicFormModel(conditional));
    const root = form(model, (path) => applyDynamicFormSchema(path, conditional), {
      injector,
    });

    expect(root['phone']().required()).toBe(false);
    expect(root['phone']().valid()).toBe(true);

    root['fulfillment']().value.set('delivery');

    expect(root['phone']().required()).toBe(false);
    expect(root['phone']().valid()).toBe(true);

    root['fulfillment']().value.set('pickup');

    expect(root['phone']().required()).toBe(true);
    expect(root['phone']().valid()).toBe(false);
    expect(root['phone']().errors()[0]?.kind).toBe('required');
    expect(root['phone']().errors()[0]?.message).toBe(
      'Phone is required for store pickup.',
    );
    expect(root().valid()).toBe(false);

    root['phone']().value.set('+30 210 000 0000');

    expect(root['phone']().valid()).toBe(true);
    expect(root().valid()).toBe(true);

    root['phone']().value.set('');
    root['fulfillment']().value.set('delivery');

    expect(root['phone']().required()).toBe(false);
    expect(root['phone']().valid()).toBe(true);
    expect(root().valid()).toBe(true);
  });

  it('disables a field while the sibling selection matches disabledWhen', () => {
    const conditional: DynamicFormSchema = {
      id: 'customOrderRequest',
      title: 'Custom order request',
      submitLabel: 'Submit request',
      sections: [
        {
          id: 'request',
          title: 'Request',
          fields: [
            {
              key: 'fulfillment',
              type: 'radio',
              label: 'Fulfillment',
              options: [
                { value: 'delivery', label: 'Delivery' },
                { value: 'pickup', label: 'Store pickup' },
              ],
            },
            {
              key: 'pickupNote',
              type: 'text',
              label: 'Pickup note',
              disabledWhen: { key: 'fulfillment', equals: 'pickup' },
            },
          ],
        },
      ],
    };
    const injector = TestBed.inject(Injector);
    const model = signal(dynamicFormModel(conditional));
    const root = form(model, (path) => applyDynamicFormSchema(path, conditional), {
      injector,
    });

    root['pickupNote']().value.set('Front desk');

    expect(root['pickupNote']().disabled()).toBe(false);

    root['fulfillment']().value.set('pickup');

    expect(root['pickupNote']().disabled()).toBe(true);
    expect(root['pickupNote']().value()).toBe('Front desk');
    expect(readDynamicFormValue(conditional, model())).toEqual({
      fulfillment: 'pickup',
      pickupNote: 'Front desk',
    });

    root['fulfillment']().value.set('delivery');

    expect(root['pickupNote']().disabled()).toBe(false);
    expect(root['pickupNote']().value()).toBe('Front desk');
  });

  it('rejects confirmEmail until it equals email, and rechecks when email changes', () => {
    const withConfirm: DynamicFormSchema = {
      id: 'customOrderRequest',
      title: 'Custom order request',
      submitLabel: 'Submit request',
      sections: [
        {
          id: 'contact',
          title: 'Contact',
          fields: [
            {
              key: 'email',
              type: 'email',
              label: 'Email',
              validators: [
                { kind: 'required', message: 'Email is required.' },
                { kind: 'email', message: 'Enter a valid email address.' },
              ],
            },
            {
              key: 'confirmEmail',
              type: 'email',
              label: 'Confirm email',
              validators: [
                { kind: 'required', message: 'Confirm the email address.' },
                { kind: 'email', message: 'Enter a valid email address.' },
                {
                  kind: 'matches',
                  field: 'email',
                  message: 'Email addresses must match.',
                },
              ],
            },
          ],
        },
      ],
    };
    const injector = TestBed.inject(Injector);
    const model = signal(dynamicFormModel(withConfirm));
    const root = form(model, (path) => applyDynamicFormSchema(path, withConfirm), {
      injector,
    });

    root['email']().value.set('ada@example.com');
    root['confirmEmail']().value.set('td@email.com');

    expect(root['confirmEmail']().errors().map((error) => error.kind)).toContain(
      'matches',
    );
    expect(
      root['confirmEmail']().errors().find((error) => error.kind === 'matches')
        ?.message,
    ).toBe('Email addresses must match.');
    expect(root['confirmEmail']().valid()).toBe(false);

    root['confirmEmail']().value.set('ada@example.com');

    expect(root['confirmEmail']().valid()).toBe(true);
    expect(root['confirmEmail']().errors()).toEqual([]);

    root['email']().value.set('other@example.com');

    expect(root['confirmEmail']().errors()[0]?.kind).toBe('matches');
    expect(root['confirmEmail']().valid()).toBe(false);
  });

  it('rejects a taken email, ignoring case, and accepts one that is free', async () => {
    const withEmail: DynamicFormSchema = {
      id: 'customOrderRequest',
      title: 'Custom order request',
      submitLabel: 'Submit request',
      sections: [
        {
          id: 'contact',
          title: 'Contact',
          fields: [
            {
              key: 'email',
              type: 'email',
              label: 'Email',
              validators: [
                { kind: 'required', message: 'Email is required.' },
                { kind: 'email', message: 'Enter a valid email address.' },
              ],
              asyncValidators: [
                {
                  kind: 'notOneOf',
                  value: ['taken@example.com'],
                  message: 'This email is already registered.',
                },
              ],
            },
          ],
        },
      ],
    };
    const injector = TestBed.inject(Injector);
    const model = signal(dynamicFormModel(withEmail));
    const root = form(model, (path) => applyDynamicFormSchema(path, withEmail), {
      injector,
    });

    expect(root['email']().errors()[0]?.message).toBe('Email is required.');
    expect(root['email']().pending()).toBe(false);

    root['email']().value.set('Taken@Example.com');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(root['email']().errors()[0]?.kind).toBe('notOneOf');
    expect(root['email']().errors()[0]?.message).toBe(
      'This email is already registered.',
    );
    expect(root['email']().valid()).toBe(false);

    root['email']().value.set('ada@example.com');
    await TestBed.inject(ApplicationRef).whenStable();

    expect(root['email']().valid()).toBe(true);
    expect(root['email']().errors()).toEqual([]);
  });

  it('keeps a date empty until one is chosen and submits it as YYYY-MM-DD', () => {
    const withDate: DynamicFormSchema = {
      id: 'customOrderRequest',
      title: 'Custom order request',
      submitLabel: 'Submit request',
      sections: [
        {
          id: 'schedule',
          title: 'Schedule',
          fields: [
            {
              key: 'neededBy',
              type: 'date',
              label: 'Needed by',
              validators: [{ kind: 'required', message: 'Choose a date.' }],
            },
          ],
        },
      ],
    };
    const injector = TestBed.inject(Injector);
    const model = signal(dynamicFormModel(withDate));
    const root = form(model, (path) => applyDynamicFormSchema(path, withDate), {
      injector,
    });

    expect(root['neededBy']().value()).toBeNull();
    expect(root['neededBy']().errors()[0]?.message).toBe('Choose a date.');
    expect(readDynamicFormValue(withDate, model())).toEqual({ neededBy: '' });

    root['neededBy']().value.set(new Date(2026, 9, 9));

    expect(root['neededBy']().valid()).toBe(true);
    expect(readDynamicFormValue(withDate, model())).toEqual({
      neededBy: '2026-10-09',
    });
  });

  it('starts a repeat empty, validates each added row, and includes the rows in the payload', () => {
    const withRows: DynamicFormSchema = {
      id: 'customOrderRequest',
      title: 'Custom order request',
      submitLabel: 'Submit request',
      sections: [
        {
          id: 'items',
          title: 'Line items',
          fields: [
            {
              key: 'lineItems',
              type: 'repeat',
              label: 'Products',
              addLabel: 'Add item',
              removeLabel: 'Remove',
              fields: [
                {
                  key: 'sku',
                  type: 'text',
                  label: 'SKU',
                  validators: [{ kind: 'required', message: 'SKU is required.' }],
                },
                {
                  key: 'quantity',
                  type: 'number',
                  label: 'Quantity',
                  validators: [
                    { kind: 'min', value: 1, message: 'Quantity must be at least 1.' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const injector = TestBed.inject(Injector);
    const model = signal(dynamicFormModel(withRows));
    const root = form(model, (path) => applyDynamicFormSchema(path, withRows), {
      injector,
    });
    const rows = root['lineItems'] as FieldTree<DynamicFormModel[]>;

    expect(rows().value()).toEqual([]);

    rows().value.set([{ sku: '', quantity: null }]);

    const row = rows[0] as FieldTree<DynamicFormModel>;
    expect(row['sku']().errors()[0]?.message).toBe('SKU is required.');
    row['sku']().value.set('SKU-100');
    row['quantity']().value.set(0);
    expect(row['quantity']().errors()[0]?.message).toBe('Quantity must be at least 1.');
    row['quantity']().value.set(2);

    expect(readDynamicFormValue(withRows, model())).toEqual({
      lineItems: [{ sku: 'SKU-100', quantity: 2 }],
    });
  });
});
