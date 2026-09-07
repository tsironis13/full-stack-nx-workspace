import type { ConvertProductItemResultWire } from '../infrastructure/public-api';

/** Live Inventory for a Product Item from a conversion HTTP result. */
export function liveInventoryFromConversion(
  result: ConvertProductItemResultWire,
  productItemId: number,
): number | null {
  if (result.status === 'matched') {
    if (Number(result.productItem.id) !== productItemId) {
      return null;
    }
    return Number(result.productItem.inventory);
  }
  if (result.status === 'needs_options') {
    const item = result.items.find((row) => Number(row.id) === productItemId);
    return item == null ? null : Number(item.inventory);
  }
  return null;
}
