export type ProductCatalogFiltersQuery = {
  categoryId: number;
  filter: Record<string, []> | null;
};

export type ProductCatalogQuery = {
  filters: ProductCatalogFiltersQuery | null;
  page: number;
  limit: number;
};
