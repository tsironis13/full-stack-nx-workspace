import type { ProductReviewPage } from '../review.types';

export abstract class ReviewsRepository {
  abstract productExists(productId: number): Promise<boolean>;

  abstract findVisibleReviewsPage(params: {
    productId: number;
    page: number;
    pageSize: number;
  }): Promise<ProductReviewPage>;
}
