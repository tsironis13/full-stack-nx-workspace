/** Wire types for Product Item conversion on ecommerce-api. */

export type ConversionOptionWire = {
  name: string;
  value: string;
};

export type ConversionProductItemWire = {
  id: number;
  options: ConversionOptionWire[];
  salePrice: number | null;
  originalPrice: number | null;
  inventory: number;
  name: string | null;
  imageUrl: string | null;
  disabled?: boolean;
};

export type ConvertProductItemResultWire =
  | { status: 'matched'; productItem: ConversionProductItemWire }
  | { status: 'needs_options'; items: ConversionProductItemWire[] }
  | { status: 'all_out_of_stock' }
  | { status: 'not_found' };
