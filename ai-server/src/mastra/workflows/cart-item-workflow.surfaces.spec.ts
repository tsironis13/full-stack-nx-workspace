import {
  buildConfirmSurface,
  buildOptionPickerSurface,
  formatOptions,
} from './cart-item-workflow.surfaces';

describe('Cart Item workflow option pickers', () => {
  const items = [
    {
      id: 1,
      options: [{ name: 'Color', value: 'Red' }],
      salePrice: 19.5,
      originalPrice: 24,
      inventory: 8,
      name: 'Trail Bottle',
      imageUrl: null,
      disabled: false,
    },
    {
      id: 2,
      options: [{ name: 'Color', value: 'Blue' }],
      salePrice: 19.5,
      originalPrice: 24,
      inventory: 0,
      name: 'Trail Bottle',
      imageUrl: null,
      disabled: true,
    },
  ];

  it('uses base-catalog CheckBox/Button submitAnswer with labeled in-stock options', () => {
    const envelope = buildOptionPickerSurface(7, items);
    const update = envelope.messages.find(
      (message) => 'updateComponents' in message,
    ) as {
      updateComponents: { components: Record<string, unknown>[] };
    };
    const components = update.updateComponents.components;
    const checkbox = components.find(
      (component) => component['component'] === 'CheckBox',
    );
    const submit = components.find(
      (component) => component['id'] === 'submit',
    ) as {
      action: { event: { name: string; context: Record<string, unknown> } };
    };
    const submitLabel = components.find(
      (component) => component['id'] === 'submit-label',
    );

    expect(checkbox).toEqual(
      expect.objectContaining({
        component: 'CheckBox',
        label: `${formatOptions(items[0].options)} · €19.50`,
        value: { path: '/options/checked_1' },
      }),
    );
    expect(submit.action.event.name).toBe('submitAnswer');
    expect(submit.action.event.context['pick']).toEqual({
      path: '/options/pick',
    });
    expect(submitLabel).toEqual(
      expect.objectContaining({ component: 'Text', text: 'Συνέχεια' }),
    );
  });

  it('does not let the shopper confirm an Out of Stock Product Item', () => {
    const envelope = buildOptionPickerSurface(7, items);
    const update = envelope.messages.find(
      (message) => 'updateComponents' in message,
    ) as {
      updateComponents: { components: Record<string, unknown>[] };
    };
    const components = update.updateComponents.components;
    const oos = components.find((component) => component['id'] === 'option-2');
    const checkboxes = components.filter(
      (component) => component['component'] === 'CheckBox',
    );
    const data = envelope.messages.find(
      (message) => 'updateDataModel' in message,
    ) as { updateDataModel: { value: Record<string, unknown> } };

    expect(oos).toEqual(
      expect.objectContaining({
        component: 'Text',
        text: expect.stringMatching(/μη διαθέσιμο/),
      }),
    );
    expect(checkboxes).toHaveLength(1);
    expect(data.updateDataModel.value).not.toHaveProperty('checked_2');
  });
});

describe('Cart Item workflow confirm quantity', () => {
  const item = {
    id: 1,
    options: [{ name: 'Color', value: 'Red' }],
    salePrice: 19.5,
    originalPrice: 24,
    inventory: 8,
    name: 'Trail Bottle',
    imageUrl: null,
  };

  function confirmComponents() {
    const envelope = buildConfirmSurface(7, item);
    const update = envelope.messages.find(
      (message) => 'updateComponents' in message,
    ) as {
      updateComponents: { components: Record<string, unknown>[] };
    };
    return update.updateComponents.components;
  }

  it('caps the quantity field at Inventory and shows when the max is reached', () => {
    const components = confirmComponents();
    const qty = components.find((component) => component['id'] === 'qty');
    const hint = components.find((component) => component['id'] === 'qty-max');
    const submit = components.find((component) => component['id'] === 'submit');

    expect(qty).toEqual(
      expect.objectContaining({
        component: 'TextField',
        variant: 'number',
        value: { path: '/confirm/quantity' },
        checks: expect.arrayContaining([
          expect.objectContaining({
            condition: {
              call: 'numeric',
              args: {
                value: { path: '/confirm/quantity' },
                max: 8,
              },
            },
            message: 'Έχετε φτάσει τη μέγιστη ποσότητα (8)',
          }),
        ]),
      }),
    );
    expect(hint).toEqual(
      expect.objectContaining({
        component: 'Text',
        text: 'Διαθέσιμα: 8',
      }),
    );
    expect(submit).toEqual(
      expect.objectContaining({
        checks: expect.arrayContaining([
          expect.objectContaining({
            condition: {
              call: 'numeric',
              args: {
                value: { path: '/confirm/quantity' },
                max: 8,
              },
            },
          }),
        ]),
      }),
    );
  });
});
