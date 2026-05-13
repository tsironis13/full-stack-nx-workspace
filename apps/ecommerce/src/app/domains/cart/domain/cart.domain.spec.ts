import { tryParseClientCartEnvelope } from './cart.envelope';
import { CLIENT_CART_SCHEMA_VERSION } from './cart.models';
import {
  addOrMergeLines,
  decrementLineQuantityOrRemove,
  removeLineByMainProductItemId,
} from './cart.rules';

const row = (overrides: Partial<Parameters<typeof addOrMergeLines>[1]> = {}) => ({
  productId: 10,
  name: 'Thing',
  mainProductItemId: 100,
  salePrice: 9.99,
  originalPrice: 12,
  primaryImageUrl: 'https://x/img.png',
  ...overrides,
});

describe('cart domain rules', () => {
  it('merges duplicate mainProductItemId and sums quantity', () => {
    const lines = addOrMergeLines([], row(), 1);
    const merged = addOrMergeLines(lines, row(), 2);
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(3);
  });

  it('refreshes snapshot fields from the latest qualifying add', () => {
    const first = addOrMergeLines([], row({ salePrice: 10, name: 'Old' }), 1);
    const second = addOrMergeLines(first, row({ salePrice: 20, name: 'New' }), 1);
    expect(second[0].salePrice).toBe(20);
    expect(second[0].name).toBe('New');
    expect(second[0].quantity).toBe(2);
  });

  it('decrement at quantity 1 removes the line', () => {
    const lines = addOrMergeLines([], row(), 1);
    const after = decrementLineQuantityOrRemove(lines, 100);
    expect(after).toHaveLength(0);
  });

  it('decrement above 1 decreases quantity', () => {
    const lines = addOrMergeLines([], row(), 2);
    const after = decrementLineQuantityOrRemove(lines, 100);
    expect(after).toEqual([{ ...lines[0], quantity: 1 }]);
  });

  it('removeLine drops the mainProductItemId', () => {
    const lines = addOrMergeLines([], row({ mainProductItemId: 1 }), 1);
    const more = addOrMergeLines(lines, row({ mainProductItemId: 2 }), 1);
    expect(removeLineByMainProductItemId(more, 1)).toHaveLength(1);
  });
});

describe('tryParseClientCartEnvelope', () => {
  it('returns null for wrong schemaVersion', () => {
    expect(
      tryParseClientCartEnvelope({
        schemaVersion: 99,
        items: [],
      })
    ).toBeNull();
  });

  it('returns null for invalid items array content', () => {
    expect(
      tryParseClientCartEnvelope({
        schemaVersion: CLIENT_CART_SCHEMA_VERSION,
        items: [{ not: 'a line' }],
      })
    ).toBeNull();
  });

  it('parses valid v1 envelope', () => {
    const v = tryParseClientCartEnvelope({
      schemaVersion: CLIENT_CART_SCHEMA_VERSION,
      items: [
        {
          quantity: 2,
          productId: 1,
          mainProductItemId: 2,
          name: 'N',
          salePrice: 1,
          originalPrice: 2,
          primaryImageUrl: 'u',
        },
      ],
    });
    expect(v?.items).toHaveLength(1);
    expect(v?.items[0].quantity).toBe(2);
  });

  it('coerces string productId and mainProductItemId to numbers', () => {
    const v = tryParseClientCartEnvelope({
      schemaVersion: CLIENT_CART_SCHEMA_VERSION,
      items: [
        {
          quantity: 1,
          productId: '7',
          mainProductItemId: '99',
          name: 'String IDs',
          salePrice: 5,
          originalPrice: null,
          primaryImageUrl: null,
        },
      ],
    });
    expect(v).not.toBeNull();
    expect(v?.items[0].productId).toBe(7);
    expect(v?.items[0].mainProductItemId).toBe(99);
  });

  it('returns null when productId is a non-numeric string', () => {
    expect(
      tryParseClientCartEnvelope({
        schemaVersion: CLIENT_CART_SCHEMA_VERSION,
        items: [
          {
            quantity: 1,
            productId: 'abc',
            mainProductItemId: 1,
            name: null,
            salePrice: null,
            originalPrice: null,
            primaryImageUrl: null,
          },
        ],
      })
    ).toBeNull();
  });
});
