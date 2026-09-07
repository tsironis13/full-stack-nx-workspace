export const BASIC_CATALOG_ID =
  'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';

export type A2uiEnvelope = {
  surfaceId: string;
  messages: Record<string, unknown>[];
};

function text(id: string, value: string, variant: 'h3' | 'body' = 'body') {
  return { id, component: 'Text', text: value, variant };
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

export function buildMessageSurface(
  surfaceId: string,
  title: string,
  body: string,
): A2uiEnvelope {
  return {
    surfaceId,
    messages: [
      {
        createSurface: { surfaceId, catalogId: BASIC_CATALOG_ID },
      },
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

export function buildAbandonedSurface(surfaceId: string): A2uiEnvelope {
  return {
    surfaceId,
    messages: [
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
            text('title', 'Ακυρώθηκε', 'h3'),
            text('body', 'Δεν προστέθηκε Cart Item.'),
          ],
        },
      },
    ],
  };
}

export function buildSuccessSurface(surfaceId: string): A2uiEnvelope {
  return {
    surfaceId,
    messages: [
      {
        updateComponents: {
          surfaceId,
          components: [
            { id: 'root', component: 'Column', children: ['card'] },
            { id: 'card', component: 'Card', child: 'form' },
            {
              id: 'form',
              component: 'Column',
              children: ['title', 'body', 'checkout'],
            },
            text('title', 'Προστέθηκε στο καλάθι', 'h3'),
            text('body', 'Το προϊόν προστέθηκε ως ένα Cart Item.'),
            {
              id: 'checkout',
              component: 'Button',
              child: 'checkout-label',
              action: {
                event: {
                  name: 'submitAnswer',
                  context: {
                    goToCheckout: { path: '/confirm/goToCheckout' },
                  },
                },
              },
            },
            {
              id: 'checkout-label',
              component: 'Text',
              text: 'Μετάβαση στο ταμείο',
            },
          ],
        },
      },
      {
        updateDataModel: {
          surfaceId,
          path: '/confirm',
          value: { goToCheckout: 'true' },
        },
      },
    ],
  };
}

export function buildWriteErrorSurface(surfaceId: string): A2uiEnvelope {
  return {
    surfaceId,
    messages: [
      {
        updateComponents: {
          surfaceId,
          components: [
            { id: 'root', component: 'Column', children: ['card'] },
            { id: 'card', component: 'Card', child: 'form' },
            {
              id: 'form',
              component: 'Column',
              children: ['title', 'body', 'actions'],
            },
            text('title', 'Αποτυχία προσθήκης', 'h3'),
            text(
              'body',
              'Το Cart Item δεν αποθηκεύτηκε. Δοκιμάστε ξανά ή ακυρώστε.',
            ),
            {
              id: 'actions',
              component: 'Row',
              children: ['retry', 'cancel'],
            },
            {
              id: 'retry',
              component: 'Button',
              child: 'retry-label',
              action: {
                event: {
                  name: 'submitAnswer',
                  context: confirmSubmitContext,
                },
              },
            },
            { id: 'retry-label', component: 'Text', text: 'Δοκιμή ξανά' },
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
          ],
        },
      },
    ],
  };
}
