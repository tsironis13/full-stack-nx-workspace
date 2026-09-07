import type {
  ConversionProduct,
  ConversionProductItem,
  ConvertProductItemResult,
  MatchedProductItem,
  PickerProductItem,
} from './product-item-conversion.types';

function tokenizeHint(hintText: string | undefined): string[] {
  if (!hintText) {
    return [];
  }
  return hintText
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function itemMatchesHint(
  item: ConversionProductItem,
  tokens: string[],
): boolean {
  if (tokens.length === 0) {
    return true;
  }
  const haystack = item.options
    .flatMap((option) => [option.name, option.value])
    .join(' ')
    .toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function withProductName(
  item: ConversionProductItem,
  name: string | null,
): MatchedProductItem {
  return { ...item, id: Number(item.id), name };
}

function toPickerItem(
  item: ConversionProductItem,
  name: string | null,
): PickerProductItem {
  return {
    ...withProductName(item, name),
    disabled: item.inventory <= 0,
  };
}

/**
 * Matches option hints to Product Items. Unique In Stock → matched.
 * Unique but Inventory 0, or several candidates → needs_options
 * (all Product Items, Out of Stock combinations disabled).
 * Every Product Item out of stock → all_out_of_stock.
 * Never silently uses the Main Product Item when others exist.
 */
export function matchProductItem(
  product: ConversionProduct,
  hintText?: string,
): ConvertProductItemResult {
  if (product.items.every((row) => row.inventory <= 0)) {
    return { status: 'all_out_of_stock' };
  }

  const tokens = tokenizeHint(hintText);
  const hasHints = tokens.length > 0;
  const candidates = product.items.filter((row) =>
    itemMatchesHint(row, tokens),
  );
  const inStockCandidates = candidates.filter((row) => row.inventory > 0);
  const singleItemProduct = product.items.length === 1;

  if (inStockCandidates.length === 1 && (hasHints || singleItemProduct)) {
    return {
      status: 'matched',
      productItem: withProductName(inStockCandidates[0], product.name),
    };
  }

  return {
    status: 'needs_options',
    items: product.items.map((row) => toPickerItem(row, product.name)),
  };
}
