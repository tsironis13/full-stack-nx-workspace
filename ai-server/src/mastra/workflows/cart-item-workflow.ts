import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

import {
  CART_ITEM_WORKFLOW_DESCRIPTION,
  CART_ITEM_WORKFLOW_ID,
  cartItemWorkflowInputSchema,
} from './cart-item-workflow.contract';
import {
  buildConfirmSurface,
  buildMessageSurface,
  buildOptionPickerSurface,
} from './cart-item-workflow.surfaces';

const conversionOptionSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const matchedProductItemSchema = z.object({
  id: z.coerce.number(),
  options: z.array(conversionOptionSchema),
  salePrice: z.number().nullable(),
  originalPrice: z.number().nullable(),
  inventory: z.number(),
  name: z.string().nullable(),
  imageUrl: z.string().nullable(),
  disabled: z.boolean().optional(),
});

const conversionResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('matched'),
    productItem: matchedProductItemSchema,
  }),
  z.object({
    status: z.literal('needs_options'),
    items: z.array(matchedProductItemSchema.extend({ disabled: z.boolean() })),
  }),
  z.object({ status: z.literal('all_out_of_stock') }),
  z.object({ status: z.literal('not_found') }),
]);

const a2uiMessageSchema = z.record(z.string(), z.unknown());

const workflowOutputSchema = z.object({
  surfaceId: z.string(),
  messages: z.array(a2uiMessageSchema),
});

function ecommerceApiBaseUrl(): string {
  const fromEnv = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env?.BASE_URL?.trim();
  return (fromEnv || 'http://localhost:3001/api').replace(/\/$/, '');
}

const convertProductItemStep = createStep({
  id: 'convert-product-item',
  description:
    'Resolve a Product plus optional option hints to a unique In Stock Product Item, option pickers, or a stock message, and return the A2UI surface.',
  inputSchema: cartItemWorkflowInputSchema,
  outputSchema: workflowOutputSchema,
  execute: async ({ inputData, abortSignal }) => {
    const { productId, hintText } = inputData;
    const url = new URL(`${ecommerceApiBaseUrl()}/product-items/conversion`);
    url.searchParams.set('productId', String(productId));
    if (hintText?.trim()) {
      url.searchParams.set('hintText', hintText.trim());
    }

    const response = await fetch(url, { signal: abortSignal });
    if (!response.ok) {
      throw new Error(
        `Product Item conversion failed with HTTP ${response.status}`,
      );
    }

    const parsed = conversionResultSchema.parse(await response.json());
    const surfaceId = `srf-cart-item-${productId}`;

    if (parsed.status === 'matched') {
      return buildConfirmSurface(productId, parsed.productItem);
    }

    if (parsed.status === 'not_found') {
      return buildMessageSurface(
        surfaceId,
        'Το προϊόν δεν βρέθηκε',
        'Δεν υπάρχει Product με αυτό το id.',
      );
    }

    if (parsed.status === 'all_out_of_stock') {
      return buildMessageSurface(
        surfaceId,
        'Μη διαθέσιμο',
        'Κανένα Product Item δεν είναι In Stock.',
      );
    }

    return buildOptionPickerSurface(productId, parsed.items);
  },
});

export const cartItemWorkflow = createWorkflow({
  id: CART_ITEM_WORKFLOW_ID,
  description: CART_ITEM_WORKFLOW_DESCRIPTION,
  inputSchema: cartItemWorkflowInputSchema,
  outputSchema: workflowOutputSchema,
})
  .then(convertProductItemStep)
  .commit();
