export type ProductCatalogFilter = {
  attributeId: number;
  attributeName: string;
  inputType: 'radio' | 'checkbox' | 'select';
  values: {
    valueId: number;
    valueName: string;
    productItemsCount: number;
  }[];
};
