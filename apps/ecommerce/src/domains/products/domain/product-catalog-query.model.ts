export type ProductCatalogQuery = {
  categoryId: number | null;
  filters: { attributeId: number; values: number[] }[] | null;
  priceRange: { min: number; max: number; overMax: boolean } | null; // if overMax is true, backend should interpret this as “search for anything above max value”
  page: number;
  limit: number;
};
