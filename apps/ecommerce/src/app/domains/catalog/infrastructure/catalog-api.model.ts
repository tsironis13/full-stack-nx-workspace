/** Query sort values accepted by GET /api/products/catalog (wire contract). */
export type CatalogListSortParam = 'newest' | 'price_asc' | 'price_desc';

/** Single catalog row as returned by the HTTP API (may diverge from domain over time). */
export interface CatalogListItemWire {
  productId: number;
  name: string | null;
  mainProductItemId: number;
  salePrice: number | null;
  originalPrice: number | null;
  primaryImageUrl: string | null;
  additionalOptionsCount: number;
}

export interface CatalogListResponseWire {
  items: CatalogListItemWire[];
  total: number;
  page: number;
  pageSize: number;
}
