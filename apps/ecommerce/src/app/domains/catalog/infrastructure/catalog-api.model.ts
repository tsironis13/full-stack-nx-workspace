/** Single root category row for storefront facets (wire contract). */
export interface CatalogCategoryRootWire {
  id: number;
  name: string | null;
}

export interface CatalogCategoryRootsResponseWire {
  roots: CatalogCategoryRootWire[];
}

/** Query sort values accepted by GET /api/products/catalog (wire contract). */
export type CatalogListSortParam = 'newest' | 'price_asc' | 'price_desc';

/** Single catalog row as returned by the HTTP API (may diverge from domain over time). */
export interface CatalogListItemWire {
  productId: number;
  name: string | null;
  mainProductItemId: number;
  salePrice: number | null;
  originalPrice: number | null;
  primaryImageUrl: string | null;
  additionalOptionsCount: number;
}

/** One selectable value within an attribute facet (wire contract). */
export interface AttributeFacetValueWire {
  valueId: number;
  value: string | null;
}

/** Dynamic attribute facet as returned by the API (wire contract). */
export interface AttributeFacetWire {
  attributeId: number;
  name: string | null;
  values: AttributeFacetValueWire[];
}

export interface CatalogListResponseWire {
  items: CatalogListItemWire[];
  total: number;
  page: number;
  pageSize: number;
  /** Dynamic attribute facets computed from the current filtered result set. */
  facets: AttributeFacetWire[];
}
