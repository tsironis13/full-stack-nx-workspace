import { CategoryAttributeValues } from '../domain/public-api';
import { CategoryAttributeValuesDto } from '../infrastructure/public-api';

export const categoryAttributeValuesDtoToCategoryAttributeValuesModel = (
  categoryAttributeValuesDto: CategoryAttributeValuesDto
): CategoryAttributeValues => {
  return categoryAttributeValuesDto.map((categoryAttributeValues) => ({
    attributeId: categoryAttributeValues.attribute_id,
    attributeName: categoryAttributeValues.attribute_name,
    values: categoryAttributeValues.values.map((categoryAttributeValueDto) => ({
      valueId: categoryAttributeValueDto.value_id,
      valueName: categoryAttributeValueDto.value_name,
    })),
  }));
};
