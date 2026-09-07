import { liveInventoryFromConversion } from './live-inventory.mapper';
import type { ConvertProductItemResultWire } from '../infrastructure/public-api';

describe('liveInventoryFromConversion', () => {
  const item = {
    id: 42,
    options: [{ name: 'Color', value: 'Blue' }],
    salePrice: 19.5,
    originalPrice: 24,
    inventory: 3,
    name: 'Trail Bottle',
    imageUrl: null,
  };

  it('reads Inventory from a unique matched Product Item', () => {
    const result: ConvertProductItemResultWire = {
      status: 'matched',
      productItem: item,
    };
    expect(liveInventoryFromConversion(result, 42)).toBe(3);
  });

  it('reads Inventory from pickers when stock changed since the choice', () => {
    const result: ConvertProductItemResultWire = {
      status: 'needs_options',
      items: [
        { ...item, id: 41, inventory: 8, disabled: false },
        { ...item, inventory: 0, disabled: true },
      ],
    };
    expect(liveInventoryFromConversion(result, 42)).toBe(0);
  });

  it('returns null when every Product Item is out of stock or missing', () => {
    expect(
      liveInventoryFromConversion({ status: 'all_out_of_stock' }, 42),
    ).toBeNull();
    expect(liveInventoryFromConversion({ status: 'not_found' }, 42)).toBeNull();
  });
});
