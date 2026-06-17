import type { ProductReviewsPage } from '../domain/public-api';
import type { ProductReviewsPageWire } from '../infrastructure/public-api';

export function mapProductReviewsFromWire(
  wire: ProductReviewsPageWire,
): ProductReviewsPage {
  return {
    items: wire.items.map((item) => ({
      id: Number(item.id),
      rating: Number(item.rating),
      title: item.title,
      body: item.body,
      authorDisplayName: item.authorDisplayName,
      createdAt: new Date(item.createdAt),
    })),
    total: Number(wire.total),
    page: Number(wire.page),
    pageSize: Number(wire.pageSize),
    averageRating: wire.averageRating,
    reviewCount: Number(wire.reviewCount),
  };
}
