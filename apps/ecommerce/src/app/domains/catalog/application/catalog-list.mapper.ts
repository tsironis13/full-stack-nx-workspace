import type { CatalogListResponse } from '../domain/public-api';
import type { CatalogListResponseWire } from '../infrastructure/public-api';

export function mapCatalogListFromWire(
  wire: CatalogListResponseWire
): CatalogListResponse {
  return {
    items: wire.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      mainProductItemId: item.mainProductItemId,
      salePrice: item.salePrice,
      originalPrice: item.originalPrice,
      primaryImageUrl: item.primaryImageUrl,
      additionalOptionsCount: item.additionalOptionsCount,
    })),
    total: wire.total,
    page: wire.page,
    pageSize: wire.pageSize,
    facets: (wire.facets ?? []).map((facet) => ({
      attributeId: facet.attributeId,
      name: facet.name,
      values: facet.values.map((v) => ({
        valueId: v.valueId,
        value: v.value,
      })),
    })),
  };
}
