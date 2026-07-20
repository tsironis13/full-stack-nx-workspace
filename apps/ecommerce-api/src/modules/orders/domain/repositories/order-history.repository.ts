import { OrderHistoryOrderRecord } from '../order-history.types';

export abstract class OrderHistoryRepository {
  /**
   * Returns the Registered User's `confirmed` Orders (newest first) with their
   * line items, each annotated with the id of the user's visible Review for the
   * line's Product (or null when none exists).
   */
  abstract findConfirmedOrdersWithReviewStatus(params: {
    userId: string;
  }): Promise<OrderHistoryOrderRecord[]>;
}
