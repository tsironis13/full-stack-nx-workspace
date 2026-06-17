import type { MyReview, ProductReviewsPage } from '../domain/public-api';
import type {
  MyReviewWire,
  ProductReviewsPageWire,
} from '../infrastructure/public-api';

export function mapMyReviewFromWire(wire: MyReviewWire): MyReview {
  return {
    id: Number(wire.id),
    productId: Number(wire.productId),
    rating: Number(wire.rating),
    title: wire.title,
    body: wire.body,
    authorDisplayName: wire.authorDisplayName,
    createdAt: new Date(wire.createdAt),
    updatedAt: new Date(wire.updatedAt),
  };
}

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
