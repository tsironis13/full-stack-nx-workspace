export enum CatalogSort {
  newest = 'newest',
  price_asc = 'price_asc',
  price_desc = 'price_desc',
}

/**
 * Single attribute filter selection: a shopper has chosen a specific value for
 * one attribute (e.g. Color → Red). v1 is single-select per attribute; AND
 * semantics across different attributes.
 */
export interface AttributeFilter {
  /** `attributes.id` */
  attributeId: number;
  /** `attribute_values.id` */
  valueId: number;
}

/** One selectable value within an attribute facet (returned in catalog response). */
export interface CatalogAttributeFacetValue {
  valueId: number;
  value: string | null;
}

/**
 * Dynamic attribute facet — attribute name plus the set of distinct values
 * found on **Product Items** belonging to products in the current result set.
 */
export interface CatalogAttributeFacet {
  attributeId: number;
  name: string | null;
  values: CatalogAttributeFacetValue[];
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
  /**
   * Active attribute filters (AND across attributes, single-select per attribute
   * in v1). Each entry restricts results to products that have at least one
   * **Product Item** carrying the specified attribute value.
   */
  attributeFilters?: AttributeFilter[];
}

/** HTTP/controller input; raw query strings are normalized in `CatalogListService`. */
export type CatalogListServiceInput = Omit<
  CatalogListQuery,
  'salePriceMin' | 'salePriceMax'
> & {
  minSalePrice?: string;
  maxSalePrice?: string;
  /**
   * Raw attribute filter strings from query params; format: `"${attributeId}:${valueId}"`.
   * Parsed in `CatalogListService` into `attributeFilters`.
   */
  rawAttributeFilters?: string | string[];
};
