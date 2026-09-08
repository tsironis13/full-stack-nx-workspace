import { z } from 'zod';

export const CART_ITEM_WORKFLOW_ID = 'cart-item-workflow';

export const CART_ITEM_WORKFLOW_DESCRIPTION =
  'Start Cart Item conversion for one Product from this thread\'s last shown Product recommendation cards (not unshown search hits). Use only when the shopper asks to add a last-turn recommendation that uniquely identifies one of those cards: an ordinal ("the second one"), a unique name among those cards, or a hint token that appears, case-insensitive, in exactly one of those cards\' name or options (no synonyms). Input is that Product id plus optional raw option hints as hintText. Never a Product Item id. Do not use when identity is ambiguous (zero or several cards match, or ordinal/name/option disagree), when there is no last-turn Product recommendation (including a first message that names a Product), for product-detail add, to discover extra options, or to convert more than one Product in one run. One conversion at a time: if pickers or confirm are already up, starting this abandons that run (no Cart write) and converts this Product instead — only when that Product is uniquely identified. Returns an A2UI confirm or option-picker surface; does not write the Cart.';

export const cartItemWorkflowInputSchema = z.object({
  productId: z.coerce
    .number()
    .int()
    .positive()
    .describe(
      "Product id of one uniquely identified Product from this thread's last shown Product recommendation cards. Never a Product Item id. Never an unshown search hit.",
    ),
  hintText: z
    .string()
    .optional()
    .describe(
      'Raw option hints from this utterance (color, size, and similar). Omit when the shopper stated none. Pass the shopper\'s words; do not rewrite into catalog option values. Never a Product Item id.',
    ),
});
