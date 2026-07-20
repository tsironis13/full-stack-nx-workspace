/**
 * Read models for the order-history capability (GET /orders). These are the
 * facts the repository surfaces; review-status flags (`canReview`, `hasReview`)
 * are derived in the domain via `order-history.rules.ts`.
 */
export interface OrderHistoryLineItemRecord {
  productItemId: number;
  productId: number;
  productName: string | null;
  productCode: string | null;
  salePrice: number;
  quantity: number;
  /** Id of the user's visible (non-hidden) Review for this Product, or null. */
  visibleReviewId: number | null;
}

export interface OrderHistoryOrderRecord {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: Date | null;
  items: OrderHistoryLineItemRecord[];
}
