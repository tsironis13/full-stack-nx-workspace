import { Injectable } from '@nestjs/common';
import { and, avg, count, desc, eq, isNull } from 'drizzle-orm';

import { productReviews } from '../../../db/schema/product-reviews';
import { products } from '../../../db/schema/products';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import { ReviewsRepository } from '../domain/repositories/reviews.repository';
import type { ProductReviewPage } from '../domain/review.types';

@Injectable()
export class DrizzleReviewsRepository extends ReviewsRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async productExists(productId: number): Promise<boolean> {
    const [row] = await this.drizzle.db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.id, productId), isNull(products.deletedAt)))
      .limit(1);

    return !!row;
  }

  async findVisibleReviewsPage(params: {
    productId: number;
    page: number;
    pageSize: number;
  }): Promise<ProductReviewPage> {
    const { productId, page, pageSize } = params;
    const offset = (page - 1) * pageSize;
    const visibleCondition = and(
      eq(productReviews.productId, productId),
      isNull(productReviews.hiddenAt),
    );

    const [aggregateRow] = await this.drizzle.db
      .select({
        averageRating: avg(productReviews.rating),
        reviewCount: count(productReviews.id),
      })
      .from(productReviews)
      .where(visibleCondition);

    const reviewCount = Number(aggregateRow?.reviewCount ?? 0);
    const averageRating =
      aggregateRow?.averageRating == null
        ? null
        : Number(aggregateRow.averageRating);

    const rows = await this.drizzle.db
      .select({
        id: productReviews.id,
        rating: productReviews.rating,
        title: productReviews.title,
        body: productReviews.body,
        authorDisplayName: productReviews.authorDisplayName,
        createdAt: productReviews.createdAt,
      })
      .from(productReviews)
      .where(visibleCondition)
      .orderBy(desc(productReviews.createdAt), desc(productReviews.id))
      .limit(pageSize)
      .offset(offset);

    return {
      items: rows.map((row) => ({
        id: row.id,
        rating: Number(row.rating),
        title: row.title,
        body: row.body,
        authorDisplayName: row.authorDisplayName,
        createdAt: row.createdAt ?? new Date(),
      })),
      total: reviewCount,
      summary: {
        averageRating,
        reviewCount,
      },
    };
  }
}
