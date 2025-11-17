export type ProductCatalogQuery = {
  categoryId: number | null;
  filters: { attributeId: number; values: number[] }[] | null;
  page: number;
  limit: number;
};
