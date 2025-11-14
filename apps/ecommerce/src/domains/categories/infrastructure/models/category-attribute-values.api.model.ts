type InputType = 'radio' | 'checkbox';

export type CategoryAttributeValuesDto = {
  attribute_id: number;
  attribute_name: string;
  attribute_input_type: InputType;
  values: CategoryAttributeValueDto[];
}[];

export type CategoryAttributeValueDto = {
  value_id: number;
  value_name: string;
  product_items_count?: number;
};
