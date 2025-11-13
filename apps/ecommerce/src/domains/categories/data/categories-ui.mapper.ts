import { CategoryAttributeValuesDto } from '../infrastructure/public-api';

/**
 * Sometimes we need to map data coming the backend to the UI layer directly.
 * E.g. we want to display the product items count in the categories filters.
 * Categories filters are coming from the backend as a list of attributes with their values.
 * But product items count is not part of the categories filters domain model.
 */
export const categoryFiltersDtoToCategoryFiltersViewModel = (
  categoryAttributeValuesDto: CategoryAttributeValuesDto
) => {
  return categoryAttributeValuesDto.map((attr) => ({
    attributeId: attr.attribute_id,
    attributeName: attr.attribute_name,
    values: attr.values.map((v) => ({
      valueId: v.value_id,
      valueName: v.value_name,
      productItemsCount: v.product_items_count,
    })),
  }));
};
