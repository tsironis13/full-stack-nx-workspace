export type ProductsPostDto = {
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
