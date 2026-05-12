export enum CatalogSort {
  newest = 'newest',
  price_asc = 'price_asc',
  price_desc = 'price_desc',
}

/** Parsed storefront catalog list request (application → repository). */
export interface CatalogListQuery {
  page: number;
  pageSize: number;
  sort: CatalogSort;
  q?: string;
  /** Active root `product_categories.id`; limits products to that category subtree. */
  categoryRootId?: number;
  /** Inclusive lower bound on **Sale Price** of the joined **Main Product Item**. */
  salePriceMin?: number;
  /** Inclusive upper bound on **Sale Price** of the joined **Main Product Item**. */
  salePriceMax?: number;
}

/** HTTP/controller input; raw query strings are normalized in `CatalogListService`. */
export type CatalogListServiceInput = Omit<
  CatalogListQuery,
  'salePriceMin' | 'salePriceMax'
> & {
  minSalePrice?: string;
  maxSalePrice?: string;
};
