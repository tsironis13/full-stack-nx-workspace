import { ImageViewModel } from '@full-stack-nx-workspace/shared';

export type ProductViewModel = {
  id: number;
  name: string;
  image: ImageViewModel;
  originalPrice: number;
  salePrice: number;
  quantity: number;
};

export type ProductFiltersQueryViewModel = {
  categoryId: number;
  filter: Record<string, []> | null;
};

export type ProductQueryViewModel = {
  page: number;
  limit: number;
  filters: ProductFiltersQueryViewModel | null;
};

type InputType = 'radio' | 'checkbox' | 'select';

export type ProductFilterViewModel = {
  attributeId: number;
  attributeName: string;
  inputType: InputType;
  values: {
    valueId: number;
    valueName: string;
    productItemsCount: number;
  }[];
};
