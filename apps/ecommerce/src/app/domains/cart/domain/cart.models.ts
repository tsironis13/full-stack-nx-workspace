/** Mirrors the PRD **CatalogCartLineSnapshot** contract for offline merchandising display. */
export type CatalogCartLineSnapshot = {
  quantity: number;
  productId: number;
  mainProductItemId: number;
  name: string | null;
  salePrice: number | null;
  originalPrice: number | null;
  primaryImageUrl: string | null;
};

/** v1 persistence envelope stored under the guest (or future registered-user) key. */
export type ClientCartEnvelopeV1 = {
  schemaVersion: 1;
  items: CatalogCartLineSnapshot[];
};

/**
 * Add-to-cart input shaped like **Catalog** browse **CatalogListItem** (without
 * `additionalOptionsCount`). Kept in the **cart** bounded context so **catalog**
 * is not an ESLint dependency from **cart** `domain`.
 */
export type CatalogBrowseCartAddInput = {
  productId: number;
  name: string | null;
  mainProductItemId: number;
  salePrice: number | null;
  originalPrice: number | null;
  primaryImageUrl: string | null;
};

export const CLIENT_CART_SCHEMA_VERSION = 1 as const;
