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

/**
 * Accept a numeric ID stored as either a JS `number` or a numeric `string`
 * (e.g. when an older serialisation path coerced the value to a string).
 * Returns the integer value, or `null` if the input cannot be a valid ID.
 */
function parseId(value: unknown): number | null {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      return null;
    }
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n) && Number.isInteger(n)) {
      return n;
    }
  }
  return null;
}

function parseLine(el: unknown): CatalogCartLineSnapshot | null {
  if (!isRecord(el)) {
    return null;
  }
  const productId = parseId(el['productId']);
  const mainProductItemId = parseId(el['mainProductItemId']);
  if (productId === null || mainProductItemId === null) {
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
