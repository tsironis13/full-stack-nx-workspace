import { and, eq, asc, count, ne, sql, inArray } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import {
  attributeValues,
  attributes,
  categoryAttributes,
  productImages,
  productItemAttributes,
  productItems,
  products,
} from '../db/schema';
import { DrizzleService } from '../drizzle/drizzle.service';
import { ProductsCatalogFiltersPostDto } from './dto/products-catalog-filters.post.dto';
import { ProductsCatalogPostDto } from './dto/products-catalog.post.dto';

export function getProductsCatalog(
  drizzleService: DrizzleService,
  productsCatalogPostDto: ProductsCatalogPostDto
) {
  const { categoryId, filters } = productsCatalogPostDto;

  const activeFilters = filters
    .filter((f) => f.values.length > 0)
    .map((f) => ({
      attributeId: f.attributeId,
      values: Array.isArray(f.values) ? f.values : [f.values],
    }));

  //----------------------------------------------------------------------
  // 2️⃣ Build subquery for product_item_ids that match ANY filter
  //----------------------------------------------------------------------
  const piaAlias = alias(productItemAttributes, 'pia_sub');

  const productItemIdsSubquery = drizzleService.db
    .select({ product_item_id: piaAlias.productItemId })
    .from(piaAlias)
    .where(
      activeFilters.length > 0
        ? activeFilters
            .map((f) =>
              // Each filter becomes a OR condition inside the subquery
              and(
                eq(piaAlias.attributeId, f.attributeId),
                inArray(piaAlias.attributeValueId, f.values)
              )
            )
            .reduce((prev, curr) => sql`${prev} OR ${curr}`)
        : sql`TRUE` // No filters = match all
    )
    .groupBy(piaAlias.productItemId);

  const productImageSubquery = drizzleService.db
    .select({ url: productImages.url })
    .from(productImages)
    .where(eq(productImages.productItemId, productItems.id))
    .orderBy(asc(productImages.id))
    .limit(1)
    .as('img');

  const pi2 = alias(productItems, 'pi2');

  const variationsCountSubquery = drizzleService.db
    .select({ variations_count: count().as('variations_count') })
    .from(pi2)
    .where(
      and(
        eq(pi2.productId, productItems.productId), // same product
        ne(pi2.id, productItems.id) // exclude self
      )
    )
    .as('variations_count');

  //----------------------------------------------------------------------
  // 3️⃣ Build main query
  //----------------------------------------------------------------------
  const query = drizzleService.db
    .select({
      id: products.id,
      product_item_id: productItems.id,
      sku: productItems.sku,
      category_id: products.categoryId,
      name: products.name,
      description: products.description,
      original_price: productItems.originalPrice,
      sale_price: productItems.salePrice,
      image_url: productImageSubquery.url,
      variations_count: variationsCountSubquery.variations_count,
    })
    .from(products)
    .innerJoin(productItems, eq(productItems.productId, products.id))
    .leftJoinLateral(variationsCountSubquery, sql`true`)
    .leftJoinLateral(productImageSubquery, sql`true`)
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(productItems.isMainProduct, true),
        activeFilters.length > 0
          ? sql`${productItems.id} IN (${productItemIdsSubquery})`
          : sql`TRUE` // << allow products with no attributes
      )
    );

  return query;
}

export const getProductsCatalogFilters = async (
  drizzleService: DrizzleService,
  productsCatalogFiltersPostDto: ProductsCatalogFiltersPostDto
) => {
  if (!drizzleService) {
    throw new Error('Drizzle service is required');
  }

  if (!productsCatalogFiltersPostDto) {
    throw new Error('Products catalog filters post DTO is required');
  }

  if (!productsCatalogFiltersPostDto.categoryId) {
    throw new Error('Category ID is required');
  }

  return await drizzleService.db
    .select({
      attribute_id: attributes.id,
      attribute_name: attributes.name,
      input_type: attributes.inputType,
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
    .where(
      eq(
        categoryAttributes.categoryId,
        productsCatalogFiltersPostDto.categoryId
      )
    )
    .groupBy(
      attributes.id,
      attributes.name,
      attributeValues.id,
      attributeValues.value
    )
    .orderBy(attributes.name, attributeValues.value);
};
