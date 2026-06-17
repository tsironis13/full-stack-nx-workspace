import { Injectable, NotFoundException } from '@nestjs/common';

import { ReviewsRepository } from '../../domain/repositories/reviews.repository';
import { ProductReviewsResponseDto } from '../dto/product-reviews-response.dto';

export type ListProductReviewsQuery = {
  productId: number;
  page: number;
  pageSize: number;
};

@Injectable()
export class ListProductReviewsUseCase {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  async execute(
    query: ListProductReviewsQuery,
  ): Promise<ProductReviewsResponseDto> {
    const exists = await this.reviewsRepository.productExists(query.productId);
    if (!exists) {
      throw new NotFoundException(
        `Product ${query.productId} not found`,
      );
    }

    const page = await this.reviewsRepository.findVisibleReviewsPage({
      productId: query.productId,
      page: query.page,
      pageSize: query.pageSize,
    });

    return {
      items: page.items.map((item) => ({
        id: item.id,
        rating: item.rating,
        title: item.title,
        body: item.body,
        authorDisplayName: item.authorDisplayName,
        createdAt: item.createdAt.toISOString(),
      })),
      total: page.total,
      page: query.page,
      pageSize: query.pageSize,
      averageRating: page.summary.averageRating,
      reviewCount: page.summary.reviewCount,
    };
  }
}
