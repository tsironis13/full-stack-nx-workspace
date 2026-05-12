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

/** One selectable value within a dynamic attribute facet. */
export interface AttributeFacetValue {
  valueId: number;
  value: string | null;
}

/**
 * Dynamic attribute facet — attribute name plus the distinct values present on
 * Product Items belonging to products in the current result set.
 */
export interface AttributeFacet {
  attributeId: number;
  name: string | null;
  values: AttributeFacetValue[];
}

export interface CatalogListResponse {
  items: CatalogListItem[];
  total: number;
  page: number;
  pageSize: number;
  /** Dynamic attribute facets for the current filtered result set. */
  facets: AttributeFacet[];
}
