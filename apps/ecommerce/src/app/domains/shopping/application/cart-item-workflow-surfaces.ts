import { encodeMachineText } from '../../../core/public-api';

export const BASIC_CATALOG_ID =
  'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';

export type A2uiEnvelope = {
  surfaceId: string;
  messages: Record<string, unknown>[];
};

function text(id: string, value: string, variant: 'h3' | 'body' = 'body') {
  return { id, component: 'Text', text: value, variant };
}

const confirmQuantityPath = { path: '/confirm/quantity' };

const confirmSubmitContext = {
  quantity: confirmQuantityPath,
  productId: { path: '/confirm/productId' },
  productItemId: { path: '/confirm/productItemId' },
  inventory: { path: '/confirm/inventory' },
  name: { path: '/confirm/name' },
  salePrice: { path: '/confirm/salePrice' },
  originalPrice: { path: '/confirm/originalPrice' },
  imageUrl: { path: '/confirm/imageUrl' },
};

function quantityRangeChecks(inventory: number) {
  return [
    {
      condition: {
        call: 'numeric',
        args: {
          value: confirmQuantityPath,
          min: 1,
        },
      },
      message: 'cartItemWorkflow.quantity.min',
    },
    {
      condition: {
        call: 'numeric',
        args: {
          value: confirmQuantityPath,
          max: inventory,
        },
      },
      message: encodeMachineText('cartItemWorkflow.quantity.max', {
        inventory,
      }),
    },
  ];
}

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
            text('title', 'cartItemWorkflow.abandoned.title', 'h3'),
            text('body', 'cartItemWorkflow.abandoned.body'),
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
            text('title', 'cartItemWorkflow.success.title', 'h3'),
            text('body', 'cartItemWorkflow.success.body'),
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
              text: 'cartItemWorkflow.success.checkout',
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
            text('title', 'cartItemWorkflow.writeError.title', 'h3'),
            text(
              'body',
              'cartItemWorkflow.writeError.body',
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
            { id: 'retry-label', component: 'Text', text: 'cartItemWorkflow.retry' },
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
            { id: 'cancel-label', component: 'Text', text: 'cartItemWorkflow.cancel' },
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
    ? ['image', 'name', 'options', 'price', 'qty', 'qty-max', 'actions']
    : ['name', 'options', 'price', 'qty', 'qty-max', 'actions'];

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
      label: 'cartItemWorkflow.quantity.label',
      variant: 'number',
      value: confirmQuantityPath,
      checks: quantityRangeChecks(selection.inventory),
    },
    text(
      'qty-max',
      encodeMachineText('cartItemWorkflow.available', {
        inventory: selection.inventory,
      }),
    ),
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
      checks: quantityRangeChecks(selection.inventory),
      action: {
        event: {
          name: 'submitAnswer',
          context: confirmSubmitContext,
        },
      },
    },
    { id: 'submit-label', component: 'Text', text: 'cartItemWorkflow.confirm.submit' },
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
    { id: 'cancel-label', component: 'Text', text: 'cartItemWorkflow.cancel' },
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
            text('title', 'cartItemWorkflow.outOfStockWrite.title', 'h3'),
            text(
              'body',
              'cartItemWorkflow.outOfStockWrite.body',
            ),
          ],
        },
      },
    ],
  };
}
