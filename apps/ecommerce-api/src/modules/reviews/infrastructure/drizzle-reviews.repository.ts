import { Injectable } from '@nestjs/common';
import { and, avg, count, desc, eq, isNull, sql } from 'drizzle-orm';

import { productReviews } from '../../../db/schema/product-reviews';
import { products } from '../../../db/schema/products';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import { ReviewsRepository } from '../domain/repositories/reviews.repository';
import type {
  ProductReviewPage,
  ReviewHiddenBy,
  ReviewRecord,
} from '../domain/review.types';

type ProductReviewRow = typeof productReviews.$inferSelect;

function toReviewRecord(row: ProductReviewRow): ReviewRecord {
  return {
    id: row.id,
    productId: row.productId,
    userId: row.userId,
    rating: Number(row.rating),
    title: row.title,
    body: row.body,
    authorDisplayName: row.authorDisplayName,
    hiddenAt: row.hiddenAt,
    hiddenBy: (row.hiddenBy as ReviewHiddenBy | null) ?? null,
    createdAt: row.createdAt ?? new Date(),
    updatedAt: row.updatedAt ?? new Date(),
  };
}

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

  async findByUserAndProduct(params: {
    userId: string;
    productId: number;
  }): Promise<ReviewRecord | null> {
    const [row] = await this.drizzle.db
      .select()
      .from(productReviews)
      .where(
        and(
          eq(productReviews.productId, params.productId),
          eq(productReviews.userId, params.userId),
        ),
      )
      .limit(1);

    return row ? toReviewRecord(row) : null;
  }

  async createReview(params: {
    productId: number;
    userId: string;
    rating: number;
    title: string | null;
    body: string | null;
    authorDisplayName: string;
  }): Promise<ReviewRecord> {
    const [row] = await this.drizzle.db
      .insert(productReviews)
      .values({
        productId: params.productId,
        userId: params.userId,
        rating: params.rating,
        title: params.title,
        body: params.body,
        authorDisplayName: params.authorDisplayName,
      })
      .returning();

    return toReviewRecord(row);
  }

  async updateReview(params: {
    id: number;
    rating: number;
    title: string | null;
    body: string | null;
    authorDisplayName: string;
    reactivate: boolean;
  }): Promise<ReviewRecord> {
    const [row] = await this.drizzle.db
      .update(productReviews)
      .set({
        rating: params.rating,
        title: params.title,
        body: params.body,
        authorDisplayName: params.authorDisplayName,
        updatedAt: new Date(),
        ...(params.reactivate ? { hiddenAt: null, hiddenBy: null } : {}),
      })
      .where(eq(productReviews.id, params.id))
      .returning();

    return toReviewRecord(row);
  }

  async hideReview(params: {
    id: number;
    hiddenBy: ReviewHiddenBy;
  }): Promise<ReviewRecord> {
    const [row] = await this.drizzle.db
      .update(productReviews)
      .set({
        hiddenAt: sql`now()`,
        hiddenBy: params.hiddenBy,
        updatedAt: new Date(),
      })
      .where(eq(productReviews.id, params.id))
      .returning();

    return toReviewRecord(row);
  }
}
