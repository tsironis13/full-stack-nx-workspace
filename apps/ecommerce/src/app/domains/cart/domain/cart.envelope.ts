import type { CatalogCartLineSnapshot, ClientCartEnvelopeV1 } from './cart.models';
import { CLIENT_CART_SCHEMA_VERSION } from './cart.models';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parsePositiveIntQty(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  const n = Math.trunc(value);
  if (n < 1) {
    return null;
  }
  return n;
}

function parseLine(el: unknown): CatalogCartLineSnapshot | null {
  if (!isRecord(el)) {
    return null;
  }
  const productId = el['productId'];
  const mainProductItemId = el['mainProductItemId'];
  if (typeof productId !== 'number' || typeof mainProductItemId !== 'number') {
    return null;
  }
  const quantity = parsePositiveIntQty(el['quantity']);
  if (quantity === null) {
    return null;
  }
  const name = el['name'];
  const salePrice = el['salePrice'];
  const originalPrice = el['originalPrice'];
  const primaryImageUrl = el['primaryImageUrl'];
  if (
    name !== undefined &&
    name !== null &&
    typeof name !== 'string'
  ) {
    return null;
  }
  if (
    salePrice !== undefined &&
    salePrice !== null &&
    typeof salePrice !== 'number'
  ) {
    return null;
  }
  if (
    originalPrice !== undefined &&
    originalPrice !== null &&
    typeof originalPrice !== 'number'
  ) {
    return null;
  }
  if (
    primaryImageUrl !== undefined &&
    primaryImageUrl !== null &&
    typeof primaryImageUrl !== 'string'
  ) {
    return null;
  }
  return {
    quantity,
    productId,
    mainProductItemId,
    name: name === undefined || name === null ? null : name,
    salePrice: salePrice === undefined || salePrice === null ? null : salePrice,
    originalPrice:
      originalPrice === undefined || originalPrice === null ? null : originalPrice,
    primaryImageUrl:
      primaryImageUrl === undefined || primaryImageUrl === null
        ? null
        : primaryImageUrl,
  };
}

/**
 * Validates an envelope parsed from storage. Wrong version, missing fields, or
 * invalid lines → `null` (caller treats as empty cart).
 */
export function tryParseClientCartEnvelope(
  raw: unknown
): ClientCartEnvelopeV1 | null {
  if (!isRecord(raw)) {
    return null;
  }
  if (raw['schemaVersion'] !== CLIENT_CART_SCHEMA_VERSION) {
    return null;
  }
  const itemsRaw = raw['items'];
  if (!Array.isArray(itemsRaw)) {
    return null;
  }
  const items: CatalogCartLineSnapshot[] = [];
  for (const el of itemsRaw) {
    const line = parseLine(el);
    if (line === null) {
      return null;
    }
    items.push(line);
  }
  return { schemaVersion: CLIENT_CART_SCHEMA_VERSION, items };
}
