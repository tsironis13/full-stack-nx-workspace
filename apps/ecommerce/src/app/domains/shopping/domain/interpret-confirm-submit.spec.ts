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

  it('treats a path-seeded abandon flag as cancel', () => {
    expect(interpretConfirmSubmit({ abandon: 'true' })).toEqual({
      kind: 'cancel',
    });
  });

  it('treats goToCheckout as checkout navigation', () => {
    expect(interpretConfirmSubmit({ goToCheckout: 'true' })).toEqual({
      kind: 'checkout',
    });
  });
});
