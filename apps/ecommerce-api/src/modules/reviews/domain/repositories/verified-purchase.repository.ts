/**
 * Verified purchase is enforced server-side: there must EXIST a `confirmed`
 * Order for the user containing an Order Item whose Product Item belongs to
 * the target Product. `pending` and `cancelled` Orders do not qualify.
 */
export abstract class VerifiedPurchaseRepository {
  abstract hasVerifiedPurchase(params: {
    userId: string;
    productId: number;
  }): Promise<boolean>;
}
