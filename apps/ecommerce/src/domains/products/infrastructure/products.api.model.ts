export type ProductsCatalogPostDto = {
  page: number;
  limit: number;
};

export type ProductDto = {
  id: number;
  name: string;
  image_url: string;
  original_price: number;
  sale_price: number;
};

export type ProductsCatalogFiltersPostDto = {
  categoryId: number;
  filter: Record<string, []> | null;
};

export type ProductCatalogFilterDto = {
  attribute_id: number;
  attribute_name: string;
  attribute_input_type: 'radio' | 'checkbox';
  values: {
    value_id: number;
    value_name: string;
    product_items_count: number;
  }[];
};
