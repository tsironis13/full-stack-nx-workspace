import type { CatalogListResponse } from '../domain/public-api';
import type { CatalogListResponseWire } from '../infrastructure/public-api';

export function mapCatalogListFromWire(
  wire: CatalogListResponseWire
): CatalogListResponse {
  return {
    items: wire.items.map((item) => ({
      productId: Number(item.productId),
      name: item.name,
      mainProductItemId: Number(item.mainProductItemId),
      salePrice: item.salePrice,
      originalPrice: item.originalPrice,
      primaryImageUrl: item.primaryImageUrl,
      additionalOptionsCount: Number(item.additionalOptionsCount),
      averageRating:
        item.averageRating == null ? null : Number(item.averageRating),
      reviewCount: Number(item.reviewCount ?? 0),
    })),
    total: Number(wire.total),
    page: Number(wire.page),
    pageSize: Number(wire.pageSize),
    facets: (wire.facets ?? []).map((facet) => ({
      attributeId: Number(facet.attributeId),
      name: facet.name,
      values: facet.values.map((v) => ({
        valueId: Number(v.valueId),
        value: v.value,
      })),
    })),
  };
}
