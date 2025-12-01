import { PriceRange } from './price-range.model';

export type ProductCatalogFiltersQuery = {
  categoryId: number;
  priceRange: PriceRange | null;
};
