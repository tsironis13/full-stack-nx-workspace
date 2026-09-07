import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

import {
  CART_ITEM_WORKFLOW_DESCRIPTION,
  CART_ITEM_WORKFLOW_ID,
  cartItemWorkflowInputSchema,
} from './cart-item-workflow.contract';

const BASIC_CATALOG_ID =
  'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';

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
});

const conversionResultSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('matched'),
    productItem: matchedProductItemSchema,
  }),
  z.object({
    status: z.literal('needs_options'),
    items: z.array(matchedProductItemSchema),
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

function formatPrice(value: number | null): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  return `€${value.toFixed(2)}`;
}

function formatOptions(
  options: { name: string; value: string }[],
): string {
  if (options.length === 0) {
    return '—';
  }
  return options.map((option) => `${option.name}: ${option.value}`).join(' · ');
}

function text(
  id: string,
  value: string,
  variant: 'h3' | 'body' = 'body',
): Record<string, unknown> {
  return { id, component: 'Text', text: value, variant };
}

function buildMessageSurface(
  surfaceId: string,
  title: string,
  body: string,
): z.infer<typeof workflowOutputSchema> {
  return {
    surfaceId,
    messages: [
      { createSurface: { surfaceId, catalogId: BASIC_CATALOG_ID } },
      {
        updateComponents: {
          surfaceId,
          components: [
            { id: 'root', component: 'Column', children: ['card'] },
            { id: 'card', component: 'Card', child: 'form' },
            {
              id: 'form',
              component: 'Column',
              children: ['title', 'body'],
            },
            text('title', title, 'h3'),
            text('body', body),
          ],
        },
      },
    ],
  };
}

const confirmSubmitContext = {
  quantity: { path: '/confirm/quantity' },
  productId: { path: '/confirm/productId' },
  productItemId: { path: '/confirm/productItemId' },
  inventory: { path: '/confirm/inventory' },
  name: { path: '/confirm/name' },
  salePrice: { path: '/confirm/salePrice' },
  originalPrice: { path: '/confirm/originalPrice' },
  imageUrl: { path: '/confirm/imageUrl' },
};

function buildConfirmSurface(
  productId: number,
  item: z.infer<typeof matchedProductItemSchema>,
): z.infer<typeof workflowOutputSchema> {
  const surfaceId = `srf-cart-item-${productId}`;
  const formChildren = item.imageUrl
    ? ['image', 'name', 'options', 'price', 'qty', 'actions']
    : ['name', 'options', 'price', 'qty', 'actions'];

  const components: Record<string, unknown>[] = [
    { id: 'root', component: 'Column', children: ['card'] },
    { id: 'card', component: 'Card', child: 'form' },
    { id: 'form', component: 'Column', children: formChildren },
  ];

  if (item.imageUrl) {
    components.push({
      id: 'image',
      component: 'Image',
      url: item.imageUrl,
      description: item.name ?? 'Product',
    });
  }

  components.push(
    text('name', item.name ?? '—', 'h3'),
    text('options', formatOptions(item.options)),
    text('price', formatPrice(item.salePrice)),
    {
      id: 'qty',
      component: 'TextField',
      label: 'Ποσότητα',
      value: { path: '/confirm/quantity' },
    },
    {
      id: 'actions',
      component: 'Row',
      children: ['submit', 'cancel'],
    },
    {
      id: 'submit',
      component: 'Button',
      child: 'submit-label',
      variant: 'primary',
      action: {
        event: {
          name: 'submitAnswer',
          context: confirmSubmitContext,
        },
      },
    },
    { id: 'submit-label', component: 'Text', text: 'Προσθήκη στο καλάθι' },
    {
      id: 'cancel',
      component: 'Button',
      child: 'cancel-label',
      action: {
        event: {
          name: 'submitAnswer',
          context: { abandon: { path: '/confirm/abandon' } },
        },
      },
    },
    { id: 'cancel-label', component: 'Text', text: 'Ακύρωση' },
  );

  return {
    surfaceId,
    messages: [
      { createSurface: { surfaceId, catalogId: BASIC_CATALOG_ID } },
      { updateComponents: { surfaceId, components } },
      {
        updateDataModel: {
          surfaceId,
          path: '/confirm',
          value: {
            quantity: '1',
            productId: String(productId),
            productItemId: String(item.id),
            inventory: String(item.inventory),
            name: item.name ?? '',
            salePrice: item.salePrice == null ? '' : String(item.salePrice),
            originalPrice:
              item.originalPrice == null ? '' : String(item.originalPrice),
            imageUrl: item.imageUrl ?? '',
            abandon: 'true',
          },
        },
      },
    ],
  };
}

const convertProductItemStep = createStep({
  id: 'convert-product-item',
  description:
    'Resolve a Product plus optional option hints to a unique In Stock Product Item and return the A2UI confirm surface.',
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

    return buildMessageSurface(
      surfaceId,
      'Χρειάζονται επιλογές',
      'Αυτό το Product έχει περισσότερα In Stock Product Items. Οι επιλογές θα προστεθούν σε επόμενο βήμα.',
    );
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
