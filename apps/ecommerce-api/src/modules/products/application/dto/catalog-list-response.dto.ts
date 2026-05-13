export class CatalogListItemDto {
  productId!: number;
  name!: string | null;
  mainProductItemId!: number;
  salePrice!: number | null;
  originalPrice!: number | null;
  primaryImageUrl!: string | null;
  additionalOptionsCount!: number;
}

export class AttributeFacetValueDto {
  valueId!: number;
  value!: string | null;
}

export class AttributeFacetDto {
  attributeId!: number;
  name!: string | null;
  values!: AttributeFacetValueDto[];
}

export class CatalogListResponseDto {
  items!: CatalogListItemDto[];
  total!: number;
  page!: number;
  pageSize!: number;
  /** Dynamic attribute facets computed from the current filtered Product result set. */
  facets!: AttributeFacetDto[];
}
