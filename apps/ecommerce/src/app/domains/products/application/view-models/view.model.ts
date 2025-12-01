import { ImageViewModel } from '@full-stack-nx-workspace/shared';

export type ProductViewModel = {
  id: number;
  name: string;
  image: ImageViewModel;
  originalPrice: number;
  salePrice: number;
  quantity: number;
};

export type DynamicFields = {
  [key: string | number]: string[] | number[] | number | string | null;
};

export type ProductFiltersForm = {
  dynamicFields: DynamicFields;
};

export type ProductQueryViewModel = {
  page: number;
  limit: number;
  categoryId: number | null;
  filters: { attributeId: number; values: number[] }[] | null;
  priceRange: PriceRangeViewModel;
};

export type PriceRangeViewModel = {
  min: number;
  max: number;
  overMax: boolean;
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
