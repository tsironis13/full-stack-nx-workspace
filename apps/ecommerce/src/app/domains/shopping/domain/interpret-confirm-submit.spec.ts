import { interpretConfirmSubmit } from './interpret-confirm-submit';

describe('interpretConfirmSubmit', () => {
  const addContext = {
    quantity: '2',
    productId: '7',
    productItemId: '42',
    inventory: '8',
    name: 'Trail Bottle',
    salePrice: '19.5',
    originalPrice: '24',
    imageUrl: 'https://cdn.example/bottle.jpg',
  };

  it('maps confirm submitAnswer context to a Cart add payload', () => {
    expect(interpretConfirmSubmit(addContext)).toEqual({
      kind: 'add',
      payload: {
        productId: 7,
        productItemId: 42,
        quantity: 2,
        name: 'Trail Bottle',
        salePrice: 19.5,
        originalPrice: 24,
        primaryImageUrl: 'https://cdn.example/bottle.jpg',
      },
    });
  });

  it('caps quantity at Inventory', () => {
    const decision = interpretConfirmSubmit({
      ...addContext,
      quantity: '99',
      inventory: '3',
    });
    expect(decision.kind).toBe('add');
    if (decision.kind === 'add') {
      expect(decision.payload.quantity).toBe(3);
    }
  });

  it('does not write an Out of Stock Product Item', () => {
    expect(
      interpretConfirmSubmit({
        ...addContext,
        quantity: '1',
        inventory: '0',
      }),
    ).toEqual({ kind: 'invalid' });
  });

  it('treats a path-seeded abandon flag as cancel', () => {
    expect(interpretConfirmSubmit({ abandon: 'true' })).toEqual({
      kind: 'cancel',
    });
  });

  it('cancels mid-pickers when abandon is set even if pick is also present', () => {
    expect(
      interpretConfirmSubmit({
        pick: 'true',
        abandon: 'true',
        productId: '7',
        checked_1: true,
        productItemId_1: '1',
        inventory_1: '8',
      }),
    ).toEqual({ kind: 'cancel' });
  });

  it('treats goToCheckout as checkout navigation', () => {
    expect(interpretConfirmSubmit({ goToCheckout: 'true' })).toEqual({
      kind: 'checkout',
    });
  });

  it('reads a unique in-stock picker CheckBox as a pick, not a Cart write', () => {
    expect(
      interpretConfirmSubmit({
        pick: 'true',
        productId: '7',
        checked_1: true,
        productItemId_1: '1',
        inventory_1: '8',
        name_1: 'Trail Bottle',
        salePrice_1: '19.5',
        originalPrice_1: '24',
        imageUrl_1: '',
        options_1: 'Color: Red',
        checked_2: false,
      }),
    ).toEqual({
      kind: 'pick',
      selection: {
        productId: 7,
        productItemId: 1,
        inventory: 8,
        name: 'Trail Bottle',
        salePrice: 19.5,
        originalPrice: 24,
        imageUrl: '',
        options: 'Color: Red',
      },
    });
  });

  it('does not pick when no in-stock CheckBox is selected', () => {
    expect(
      interpretConfirmSubmit({
        pick: 'true',
        productId: '7',
        checked_1: false,
      }),
    ).toEqual({ kind: 'invalid' });
  });
});
