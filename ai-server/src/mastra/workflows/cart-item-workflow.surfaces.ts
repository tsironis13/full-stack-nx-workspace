export const BASIC_CATALOG_ID =
  'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';

export type ConversionOption = {
  name: string;
  value: string;
};

export type ConversionItem = {
  id: number;
  options: ConversionOption[];
  salePrice: number | null;
  originalPrice: number | null;
  inventory: number;
  name: string | null;
  imageUrl: string | null;
  disabled?: boolean;
};

export type A2uiEnvelope = {
  surfaceId: string;
  messages: Record<string, unknown>[];
};

export function formatPrice(value: number | null): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  return `€${value.toFixed(2)}`;
}

export function formatOptions(options: ConversionOption[]): string {
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

export function buildConfirmSurface(
  productId: number,
  item: ConversionItem,
): A2uiEnvelope {
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

function pickerSubmitContext(
  items: ConversionItem[],
): Record<string, { path: string }> {
  const context: Record<string, { path: string }> = {
    pick: { path: '/options/pick' },
    productId: { path: '/options/productId' },
  };
  for (const item of items) {
    if (item.disabled || item.inventory <= 0) {
      continue;
    }
    const key = String(item.id);
    context[`checked_${key}`] = { path: `/options/checked_${key}` };
    context[`productItemId_${key}`] = {
      path: `/options/productItemId_${key}`,
    };
    context[`inventory_${key}`] = { path: `/options/inventory_${key}` };
    context[`name_${key}`] = { path: `/options/name_${key}` };
    context[`salePrice_${key}`] = { path: `/options/salePrice_${key}` };
    context[`originalPrice_${key}`] = {
      path: `/options/originalPrice_${key}`,
    };
    context[`imageUrl_${key}`] = { path: `/options/imageUrl_${key}` };
    context[`options_${key}`] = { path: `/options/options_${key}` };
  }
  return context;
}

/**
 * Option pickers for a Product with more than one Product Item.
 * In Stock combinations are CheckBoxes; Out of Stock combinations are
 * labeled text only so the shopper cannot confirm unsellable units.
 */
export function buildOptionPickerSurface(
  productId: number,
  items: ConversionItem[],
): A2uiEnvelope {
  const surfaceId = `srf-cart-item-${productId}`;
  const optionIds: string[] = [];
  const components: Record<string, unknown>[] = [];
  const dataModel: Record<string, unknown> = {
    pick: 'true',
    productId: String(productId),
  };

  for (const item of items) {
    const key = String(item.id);
    const optionId = `option-${key}`;
    optionIds.push(optionId);
    const label = `${formatOptions(item.options)} · ${formatPrice(item.salePrice)}`;
    const disabled = item.disabled === true || item.inventory <= 0;

    if (disabled) {
      components.push(text(optionId, `${label} — μη διαθέσιμο`));
      continue;
    }

    components.push({
      id: optionId,
      component: 'CheckBox',
      label,
      value: { path: `/options/checked_${key}` },
    });
    dataModel[`checked_${key}`] = false;
    dataModel[`productItemId_${key}`] = String(item.id);
    dataModel[`inventory_${key}`] = String(item.inventory);
    dataModel[`name_${key}`] = item.name ?? '';
    dataModel[`salePrice_${key}`] =
      item.salePrice == null ? '' : String(item.salePrice);
    dataModel[`originalPrice_${key}`] =
      item.originalPrice == null ? '' : String(item.originalPrice);
    dataModel[`imageUrl_${key}`] = item.imageUrl ?? '';
    dataModel[`options_${key}`] = formatOptions(item.options);
  }

  const formChildren = ['title', 'body', ...optionIds, 'actions'];

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
            { id: 'form', component: 'Column', children: formChildren },
            text('title', 'Επιλέξτε επιλογές', 'h3'),
            text(
              'body',
              'Επιλέξτε ένα In Stock Product Item. Οι μη διαθέσιμοι συνδυασμοί είναι απενεργοποιημένοι.',
            ),
            ...components,
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
                  context: pickerSubmitContext(items),
                },
              },
            },
            { id: 'submit-label', component: 'Text', text: 'Συνέχεια' },
            {
              id: 'cancel',
              component: 'Button',
              child: 'cancel-label',
              action: {
                event: {
                  name: 'submitAnswer',
                  context: { abandon: { path: '/options/abandon' } },
                },
              },
            },
            { id: 'cancel-label', component: 'Text', text: 'Ακύρωση' },
          ],
        },
      },
      {
        updateDataModel: {
          surfaceId,
          path: '/options',
          value: {
            ...dataModel,
            abandon: 'true',
          },
        },
      },
    ],
  };
}
