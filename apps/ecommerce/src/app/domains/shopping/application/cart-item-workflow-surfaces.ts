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

function formatPrice(value: number | null): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  return `€${value.toFixed(2)}`;
}

export function buildConfirmSurfaceUpdate(
  surfaceId: string,
  selection: {
    productId: number;
    productItemId: number;
    inventory: number;
    name: string | null;
    salePrice: number | null;
    originalPrice: number | null;
    imageUrl: string | null;
    options: string;
  },
): A2uiEnvelope {
  const formChildren = selection.imageUrl
    ? ['image', 'name', 'options', 'price', 'qty', 'actions']
    : ['name', 'options', 'price', 'qty', 'actions'];

  const components: Record<string, unknown>[] = [
    { id: 'root', component: 'Column', children: ['card'] },
    { id: 'card', component: 'Card', child: 'form' },
    { id: 'form', component: 'Column', children: formChildren },
  ];

  if (selection.imageUrl) {
    components.push({
      id: 'image',
      component: 'Image',
      url: selection.imageUrl,
      description: selection.name ?? 'Product',
    });
  }

  components.push(
    text('name', selection.name ?? '—', 'h3'),
    text('options', selection.options),
    text('price', formatPrice(selection.salePrice)),
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
      { updateComponents: { surfaceId, components } },
      {
        updateDataModel: {
          surfaceId,
          path: '/confirm',
          value: {
            quantity: '1',
            productId: String(selection.productId),
            productItemId: String(selection.productItemId),
            inventory: String(selection.inventory),
            name: selection.name ?? '',
            salePrice:
              selection.salePrice == null ? '' : String(selection.salePrice),
            originalPrice:
              selection.originalPrice == null
                ? ''
                : String(selection.originalPrice),
            imageUrl: selection.imageUrl ?? '',
            abandon: 'true',
          },
        },
      },
    ],
  };
}

export function buildOutOfStockWriteSurface(surfaceId: string): A2uiEnvelope {
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
            text('title', 'Μη διαθέσιμο', 'h3'),
            text(
              'body',
              'Αυτό το Product Item δεν είναι πλέον In Stock. Δεν προστέθηκε Cart Item.',
            ),
          ],
        },
      },
    ],
  };
}
