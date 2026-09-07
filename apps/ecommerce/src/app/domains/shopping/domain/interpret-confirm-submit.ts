export type ConfirmCartAdd = {
  productId: number;
  productItemId: number;
  quantity: number;
  name: string | null;
  salePrice: number | null;
  originalPrice: number | null;
  primaryImageUrl: string | null;
};

export type PickerSelection = {
  productId: number;
  productItemId: number;
  inventory: number;
  name: string | null;
  salePrice: number | null;
  originalPrice: number | null;
  imageUrl: string | null;
  options: string;
};

export type ConfirmSubmitDecision =
  | { kind: 'cancel' }
  | { kind: 'checkout' }
  | { kind: 'pick'; selection: PickerSelection }
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
  if (isFlag(context['pick'])) {
    return interpretPickerSubmit(context);
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

function interpretPickerSubmit(
  context: Record<string, unknown>,
): ConfirmSubmitDecision {
  const productId = asNumber(context['productId']);
  if (productId === null) {
    return { kind: 'invalid' };
  }

  const checkedIds = Object.keys(context)
    .filter((key) => key.startsWith('checked_') && isFlag(context[key]))
    .map((key) => key.slice('checked_'.length));
  if (checkedIds.length !== 1) {
    return { kind: 'invalid' };
  }

  const id = checkedIds[0];
  const productItemId = asNumber(context[`productItemId_${id}`]);
  const inventory = asNumber(context[`inventory_${id}`]);
  if (productItemId === null || inventory === null || inventory <= 0) {
    return { kind: 'invalid' };
  }

  return {
    kind: 'pick',
    selection: {
      productId,
      productItemId,
      inventory,
      name: asString(context[`name_${id}`]),
      salePrice: asNumber(context[`salePrice_${id}`]),
      originalPrice: asNumber(context[`originalPrice_${id}`]),
      imageUrl: asString(context[`imageUrl_${id}`]),
      options: asString(context[`options_${id}`]) ?? '—',
    },
  };
}
