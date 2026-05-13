import type { CatalogBrowseCartAddInput, CatalogCartLineSnapshot } from './cart.models';

function snapshotFromRow(row: CatalogBrowseCartAddInput): Omit<CatalogCartLineSnapshot, 'quantity'> {
  return {
    productId: row.productId,
    mainProductItemId: row.mainProductItemId,
    name: row.name,
    salePrice: row.salePrice,
    originalPrice: row.originalPrice,
    primaryImageUrl: row.primaryImageUrl,
  };
}

/** One **Cart Item** per **Main Product Item**; merge sums quantity and refreshes snapshot from the latest row. */
export function addOrMergeLines(
  lines: CatalogCartLineSnapshot[],
  row: CatalogBrowseCartAddInput,
  addQty: number
): CatalogCartLineSnapshot[] {
  const safeAdd = Math.max(1, Math.trunc(addQty));
  const snap = snapshotFromRow(row);
  const idx = lines.findIndex((l) => l.mainProductItemId === row.mainProductItemId);
  if (idx === -1) {
    return [...lines, { ...snap, quantity: safeAdd }];
  }
  const prev = lines[idx];
  const refreshed: CatalogCartLineSnapshot = {
    ...snap,
    quantity: prev.quantity + safeAdd,
  };
  return [...lines.slice(0, idx), refreshed, ...lines.slice(idx + 1)];
}

export function incrementLineQuantity(
  lines: CatalogCartLineSnapshot[],
  mainProductItemId: number
): CatalogCartLineSnapshot[] {
  return lines.map((l) =>
    l.mainProductItemId === mainProductItemId ? { ...l, quantity: l.quantity + 1 } : l
  );
}

/** Decrement by 1; at quantity 1 the **Cart Item** is removed (no zero-quantity lines). */
export function decrementLineQuantityOrRemove(
  lines: CatalogCartLineSnapshot[],
  mainProductItemId: number
): CatalogCartLineSnapshot[] {
  return lines.flatMap((l) => {
    if (l.mainProductItemId !== mainProductItemId) {
      return [l];
    }
    if (l.quantity <= 1) {
      return [];
    }
    return [{ ...l, quantity: l.quantity - 1 }];
  });
}

export function removeLineByMainProductItemId(
  lines: CatalogCartLineSnapshot[],
  mainProductItemId: number
): CatalogCartLineSnapshot[] {
  return lines.filter((l) => l.mainProductItemId !== mainProductItemId);
}
