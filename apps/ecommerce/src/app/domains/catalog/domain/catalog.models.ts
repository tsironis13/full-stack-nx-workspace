export type CatalogSort = 'newest' | 'price_asc' | 'price_desc';

export interface CatalogListItem {
  productId: number;
  name: string | null;
  mainProductItemId: number;
  salePrice: number | null;
  originalPrice: number | null;
  primaryImageUrl: string | null;
  additionalOptionsCount: number;
}

export interface CatalogListResponse {
  items: CatalogListItem[];
  total: number;
  page: number;
  pageSize: number;
}
