import { PriceRange } from './price-range.model';

export type ProductCatalogQuery = {
  categoryId: number | null;
  filters: { attributeId: number; values: number[] }[] | null;
  priceRange: PriceRange | null; // if overMax is true, backend should interpret this as “search for anything above max value”
  page: number;
  limit: number;
};
