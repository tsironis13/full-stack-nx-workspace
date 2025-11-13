import { and, eq, sql } from 'drizzle-orm';

import { DrizzleService } from '../drizzle/drizzle.service';
import {
  attributeValues,
  categoryAttributes,
  productItemAttributes,
  productItems,
  products,
} from '../db/schema';
import { attributes } from '../db/schema';

export const getCategoryAttributeValuesById = async (
  drizzleService: DrizzleService,
  categoryId: number
) => {
  if (!drizzleService) {
    throw new Error('Drizzle service is required');
  }

  if (!categoryId) {
    throw new Error('Category ID is required');
  }

  return await drizzleService.db
    .select({
      attribute_id: attributes.id,
      attribute_name: attributes.name,
      value_id: attributeValues.id,
      value_name: attributeValues.value,
      product_items_count: sql<number>`COALESCE(COUNT(DISTINCT ${productItems.id}), 0)`,
    })
    .from(categoryAttributes)
    .innerJoin(attributes, eq(attributes.id, categoryAttributes.attributeId))
    .innerJoin(attributeValues, eq(attributeValues.attributeId, attributes.id))
    .leftJoin(
      productItemAttributes,
      eq(productItemAttributes.attributeValueId, attributeValues.id)
    )
    .leftJoin(
      productItems,
      eq(productItems.id, productItemAttributes.productItemId)
    )
    .leftJoin(
      products,
      and(
        eq(products.id, productItems.productId),
        eq(products.categoryId, categoryAttributes.categoryId)
      )
    )
    .where(eq(categoryAttributes.categoryId, categoryId))
    .groupBy(
      attributes.id,
      attributes.name,
      attributeValues.id,
      attributeValues.value
    )
    .orderBy(attributes.name, attributeValues.value);
};
