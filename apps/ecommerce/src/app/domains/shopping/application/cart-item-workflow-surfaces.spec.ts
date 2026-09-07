import { buildConfirmSurfaceUpdate } from './cart-item-workflow-surfaces';

describe('buildConfirmSurfaceUpdate quantity', () => {
  const selection = {
    productId: 7,
    productItemId: 1,
    inventory: 8,
    name: 'Trail Bottle',
    salePrice: 19.5,
    originalPrice: 24,
    imageUrl: null,
    options: 'Color: Red',
  };

  function confirmComponents() {
    const envelope = buildConfirmSurfaceUpdate('srf-cart-item-7', selection);
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
