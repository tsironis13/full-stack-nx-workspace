export enum CatalogSort {
  newest = 'newest',
  price_asc = 'price_asc',
  price_desc = 'price_desc',
}

export interface CatalogListQuery {
  page: number;
  pageSize: number;
  sort: CatalogSort;
  q?: string;
}
