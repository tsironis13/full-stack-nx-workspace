import { z } from 'zod';

export const CART_ITEM_WORKFLOW_ID = 'cart-item-workflow';

export const CART_ITEM_WORKFLOW_DESCRIPTION =
  'Start Cart Item conversion for one Product from this thread\'s last Product recommendations. Use when the shopper asks to add a last-turn recommendation (ordinal like "the second one", or by name), including option hints in that utterance. Input is that Product id plus optional raw option hints as hintText. Never a Product Item id. Do not use when there is no last-turn Product recommendation (including a first message that names a Product), for product-detail add, or to convert more than one Product in one run. Returns an A2UI confirm surface; does not write the Cart.';

export const cartItemWorkflowInputSchema = z.object({
  productId: z.coerce
    .number()
    .int()
    .positive()
    .describe(
      "Product id from this thread's last Product recommendations. Never a Product Item id.",
    ),
  hintText: z
    .string()
    .optional()
    .describe(
      'Raw option hints from this utterance (color, size, and similar). Omit when the shopper stated none. Never a Product Item id.',
    ),
});
