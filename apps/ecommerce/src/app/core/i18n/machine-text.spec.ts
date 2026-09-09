import {
  decodeMachineText,
  encodeMachineText,
  localizeA2uiValue,
} from './machine-text';

describe('machine-text', () => {
  it('round-trips a code without params', () => {
    expect(encodeMachineText('cartItemWorkflow.cancel')).toBe(
      'cartItemWorkflow.cancel',
    );
    expect(decodeMachineText('cartItemWorkflow.cancel')).toEqual({
      key: 'cartItemWorkflow.cancel',
    });
  });

  it('round-trips params', () => {
    const encoded = encodeMachineText('cartItemWorkflow.available', {
      inventory: 8,
    });
    expect(decodeMachineText(encoded)).toEqual({
      key: 'cartItemWorkflow.available',
      params: { inventory: 8 },
    });
  });

  it('does not treat Product names as codes', () => {
    expect(decodeMachineText('RoadRunner 5')).toBeNull();
    expect(decodeMachineText('Product')).toBeNull();
  });

  it('localizes A2UI chrome and leaves product data', () => {
    const translated = localizeA2uiValue(
      {
        text: 'cartItemWorkflow.confirm.submit',
        label: encodeMachineText('cartItemWorkflow.available', {
          inventory: 3,
        }),
        name: 'Trail Bottle',
      },
      (key, params) =>
        key === 'cartItemWorkflow.available'
          ? `Available: ${String(params?.['inventory'])}`
          : 'Add to cart',
    );
    expect(translated).toEqual({
      text: 'Add to cart',
      label: 'Available: 3',
      name: 'Trail Bottle',
    });
  });
});
