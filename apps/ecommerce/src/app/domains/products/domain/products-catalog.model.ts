import { Product } from './product.model';

export type ProductsCatalog = {
  products: Product[];
  totalResults: number;
};
