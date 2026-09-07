import type {
  ConversionProduct,
  ConversionProductItem,
  ConvertProductItemResult,
  MatchedProductItem,
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

/**
 * Matches option hints to Product Items. Unique In Stock → matched.
 * Unique but Inventory 0, or several candidates → needs_options.
 * Every Product Item out of stock → all_out_of_stock.
 */
export function matchProductItem(
  product: ConversionProduct,
  hintText?: string,
): ConvertProductItemResult {
  const tokens = tokenizeHint(hintText);
  const candidates = product.items.filter((item) =>
    itemMatchesHint(item, tokens),
  );
  const inStock = candidates.filter((item) => item.inventory > 0);

  if (inStock.length === 1) {
    return {
      status: 'matched',
      productItem: withProductName(inStock[0], product.name),
    };
  }

  if (product.items.every((item) => item.inventory <= 0)) {
    return { status: 'all_out_of_stock' };
  }

  return {
    status: 'needs_options',
    items: candidates.map((item) => withProductName(item, product.name)),
  };
}
