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
  /** Active root `product_categories.id`; limits products to that category subtree. */
  categoryRootId?: number;
}
