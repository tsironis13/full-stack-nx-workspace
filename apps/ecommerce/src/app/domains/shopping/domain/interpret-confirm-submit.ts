export type ConfirmCartAdd = {
  productId: number;
  productItemId: number;
  quantity: number;
  name: string | null;
  salePrice: number | null;
  originalPrice: number | null;
  primaryImageUrl: string | null;
};

export type ConfirmSubmitDecision =
  | { kind: 'cancel' }
  | { kind: 'checkout' }
  | { kind: 'add'; payload: ConfirmCartAdd }
  | { kind: 'invalid' };

function asString(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) {
      return n;
    }
  }
  return null;
}

function isFlag(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

/**
 * Reads `submitAnswer` context from the confirm / success A2UI surface.
 * Paths are resolved by A2UI before this runs; values are already concrete.
 */
export function interpretConfirmSubmit(
  context: Record<string, unknown>,
): ConfirmSubmitDecision {
  if (isFlag(context['abandon']) || isFlag(context['cancelled'])) {
    return { kind: 'cancel' };
  }
  if (isFlag(context['goToCheckout'])) {
    return { kind: 'checkout' };
  }

  const productId = asNumber(context['productId']);
  const productItemId = asNumber(context['productItemId']);
  const inventory = asNumber(context['inventory']);
  if (productId === null || productItemId === null || inventory === null) {
    return { kind: 'invalid' };
  }

  const requested = asNumber(context['quantity']) ?? 1;
  const quantity = Math.min(inventory, Math.max(1, Math.trunc(requested)));
  if (quantity < 1) {
    return { kind: 'invalid' };
  }

  return {
    kind: 'add',
    payload: {
      productId,
      productItemId,
      quantity,
      name: asString(context['name']),
      salePrice: asNumber(context['salePrice']),
      originalPrice: asNumber(context['originalPrice']),
      primaryImageUrl: asString(context['imageUrl']),
    },
  };
}
