export type ProductCatalogFilter = {
  attributeId: number;
  attributeName: string;
  inputType: 'radio' | 'checkbox';
  values: {
    valueId: number;
    valueName: string;
    productItemsCount: number;
  }[];
};
