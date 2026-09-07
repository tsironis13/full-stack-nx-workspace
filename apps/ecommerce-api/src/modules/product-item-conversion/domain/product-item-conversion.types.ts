/** Product Item conversion for Cart Item workflow. Not storefront catalog search. */

export type ConversionOption = {
  name: string;
  value: string;
};

export type ConversionProductItem = {
  id: number;
  options: ConversionOption[];
  salePrice: number | null;
  originalPrice: number | null;
  inventory: number;
  imageUrl: string | null;
};

export type ConversionProduct = {
  id: number;
  name: string | null;
  items: ConversionProductItem[];
};

export type MatchedProductItem = ConversionProductItem & {
  name: string | null;
};

export type ConvertProductItemResult =
  | { status: 'matched'; productItem: MatchedProductItem }
  | { status: 'needs_options'; items: MatchedProductItem[] }
  | { status: 'all_out_of_stock' }
  | { status: 'not_found' };
