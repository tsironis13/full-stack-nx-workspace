export class CatalogListItemDto {
  productId!: number;
  name!: string | null;
  mainProductItemId!: number;
  salePrice!: number | null;
  originalPrice!: number | null;
  primaryImageUrl!: string | null;
  additionalOptionsCount!: number;
}

export class CatalogListResponseDto {
  items!: CatalogListItemDto[];
  total!: number;
  page!: number;
  pageSize!: number;
}
