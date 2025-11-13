export type CategoryAttributeValuesDto = {
  attribute_id: number;
  attribute_name: string;
  values: CategoryAttributeValueDto[];
}[];

export type CategoryAttributeValueDto = {
  value_id: number;
  value_name: string;
  product_items_count?: number;
};
