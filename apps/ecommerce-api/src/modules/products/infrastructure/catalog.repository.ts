import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, exists, gte, ilike, isNull, lte, sql } from 'drizzle-orm';

import { attributeValues } from '../../../db/schema/attribute_values';
import { attributes } from '../../../db/schema/attributes';
import { productCategories } from '../../../db/schema/product-categories';
import { productItemAttributes } from '../../../db/schema/product_item_attributes';
import { productItems } from '../../../db/schema/product-items';
import { products } from '../../../db/schema/products';
import { DrizzleService } from '../../../drizzle/drizzle.service';

import { AttributeFilter, CatalogAttributeFacet, CatalogSort } from '../domain/catalog.types';

import { categorySubtreeIncludesRootCondition } from './catalog-category-subtree.sql';

export type CatalogListRow = {
  productId: number;
  name: string | null;
  mainProductItemId: number;
  salePrice: number | null;
  originalPrice: number | null;
  primaryImageUrl: string | null;
  additionalOptionsCount: number;
};

@Injectable()
export class CatalogRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findActiveRootCategories(): Promise<
    { id: number; name: string | null }[]
  > {
    return this.drizzle.db
      .select({
        id: productCategories.id,
        name: productCategories.name,
      })
      .from(productCategories)
      .where(
        and(
          isNull(productCategories.deletedAt),
          isNull(productCategories.parentCategoryId)
        )
      )
      .orderBy(asc(productCategories.name));
  }

  async isActiveRootCategory(id: number): Promise<boolean> {
    const [row] = await this.drizzle.db
      .select({ id: productCategories.id })
      .from(productCategories)
      .where(
        and(
          eq(productCategories.id, id),
          isNull(productCategories.deletedAt),
          isNull(productCategories.parentCategoryId)
        )
      )
      .limit(1);
    return !!row;
  }

  async findCatalogPage(params: {
    page: number;
    pageSize: number;
    sort: CatalogSort;
    q?: string;
    categoryRootId?: number;
    salePriceMin?: number;
    salePriceMax?: number;
    attributeFilters?: AttributeFilter[];
  }): Promise<{ rows: CatalogListRow[]; total: number }> {
    const {
      page,
      pageSize,
      sort,
      q,
      categoryRootId,
      salePriceMin,
      salePriceMax,
      attributeFilters,
    } = params;
    const offset = (page - 1) * pageSize;

    const joinMainItem = and(
      eq(productItems.productId, products.id),
      eq(productItems.isMainProduct, true),
      isNull(productItems.deletedAt)
    );

    const whereClause = this.buildBaseWhere(
      joinMainItem,
      q,
      categoryRootId,
      salePriceMin,
      salePriceMax,
      attributeFilters
    );

    const orderBy =
      sort === CatalogSort.newest
        ? [desc(products.createdAt)]
        : sort === CatalogSort.price_asc
          ? [asc(productItems.salePrice)]
          : [desc(productItems.salePrice)];

    const rows = await this.drizzle.db
      .select({
        productId: products.id,
        name: products.name,
        mainProductItemId: productItems.id,
        salePrice: productItems.salePrice,
        originalPrice: productItems.originalPrice,
        primaryImageUrl: sql<string | null>`(
          select pi.url from product_images pi
          where pi.product_item_id = ${productItems.id}
          and pi.deleted_at is null
          order by pi.id asc
          limit 1
        )`,
        additionalOptionsCount: sql<number>`greatest(0, (
          select count(*)::int - 1 from product_items pi2
          where pi2.product_id = ${products.id}
          and pi2.deleted_at is null
        ))`,
      })
      .from(products)
      .innerJoin(productItems, joinMainItem)
      .where(whereClause)
      .orderBy(...orderBy)
      .limit(pageSize)
      .offset(offset);

    const [countRow] = await this.drizzle.db
      .select({ c: count() })
      .from(products)
      .innerJoin(productItems, joinMainItem)
      .where(whereClause);

    return {
      rows: rows.map((r) => ({
        ...r,
        additionalOptionsCount: Number(r.additionalOptionsCount),
      })),
      total: Number(countRow?.c ?? 0),
    };
  }

  /**
   * Returns dynamic attribute facets: distinct (attribute, value) pairs present
   * on **Product Items** belonging to products that match the active filters.
   * Facets are computed on the same filtered product set as the list query so
   * values that would yield zero results are never returned.
   *
   * Performance note: for large catalogs this aggregation query may benefit from
   * an index on `product_item_attributes(attribute_id, attribute_value_id)` and
   * a covering index on `product_items(product_id, deleted_at)`.
   */
  async findAttributeFacets(params: {
    q?: string;
    categoryRootId?: number;
    salePriceMin?: number;
    salePriceMax?: number;
    attributeFilters?: AttributeFilter[];
  }): Promise<CatalogAttributeFacet[]> {
    const { q, categoryRootId, salePriceMin, salePriceMax, attributeFilters } =
      params;

    const joinMainItem = and(
      eq(productItems.productId, products.id),
      eq(productItems.isMainProduct, true),
      isNull(productItems.deletedAt)
    );

    const baseWhere = this.buildBaseWhere(
      joinMainItem,
      q,
      categoryRootId,
      salePriceMin,
      salePriceMax,
      attributeFilters
    );

    // Join through ALL (non-deleted) product items to pick up all attribute values,
    // not just the main item's attributes — a product may have size/color on
    // non-main items too.
    const rows = await this.drizzle.db
      .selectDistinct({
        attributeId: attributes.id,
        attributeName: attributes.name,
        valueId: attributeValues.id,
        value: attributeValues.value,
      })
      .from(products)
      .innerJoin(productItems, joinMainItem)
      .innerJoin(
        // alias: all items (not just main) belonging to products in filtered set
        sql`product_items AS all_pi`,
        sql`all_pi.product_id = ${products.id} AND all_pi.deleted_at IS NULL`
      )
      .innerJoin(
        productItemAttributes,
        sql`${productItemAttributes.productItemId} = all_pi.id`
      )
      .innerJoin(
        attributeValues,
        eq(attributeValues.id, productItemAttributes.attributeValueId)
      )
      .innerJoin(attributes, eq(attributes.id, productItemAttributes.attributeId))
      .where(baseWhere)
      .orderBy(asc(attributes.name), asc(attributeValues.value));

    // Group into facets keyed by attributeId
    const facetMap = new Map<
      number,
      { name: string | null; values: { valueId: number; value: string | null }[] }
    >();
    for (const row of rows) {
      if (!facetMap.has(row.attributeId)) {
        facetMap.set(row.attributeId, { name: row.attributeName, values: [] });
      }
      facetMap.get(row.attributeId)!.values.push({
        valueId: row.valueId,
        value: row.value,
      });
    }

    return Array.from(facetMap.entries()).map(([attributeId, facet]) => ({
      attributeId,
      name: facet.name,
      values: facet.values,
    }));
  }

  /**
   * Builds the shared WHERE clause used by both `findCatalogPage` and
   * `findAttributeFacets`. The caller must have already joined `productItems`
   * with the `joinMainItem` condition so that `productItems` columns are in scope
   * for the price-range predicates.
   */
  private buildBaseWhere(
    joinMainItem: ReturnType<typeof and>,
    q: string | undefined,
    categoryRootId: number | undefined,
    salePriceMin: number | undefined,
    salePriceMax: number | undefined,
    attributeFilters: AttributeFilter[] | undefined
  ) {
    const filters: ReturnType<typeof isNull>[] = [isNull(products.deletedAt)];
    const trimmed = q?.trim();
    if (trimmed) {
      filters.push(ilike(products.name, `%${trimmed}%`));
    }
    if (categoryRootId !== undefined) {
      filters.push(categorySubtreeIncludesRootCondition(categoryRootId));
    }
    if (salePriceMin !== undefined) {
      filters.push(gte(productItems.salePrice, salePriceMin));
    }
    if (salePriceMax !== undefined) {
      filters.push(lte(productItems.salePrice, salePriceMax));
    }

    // AND across attributes: for each active filter add an EXISTS subquery that
    // confirms the product has at least one item carrying that attribute value.
    if (attributeFilters && attributeFilters.length > 0) {
      for (const { attributeId, valueId } of attributeFilters) {
        filters.push(
          exists(
            this.drizzle.db
              .select({ one: sql`1` })
              .from(productItems)
              .innerJoin(
                productItemAttributes,
                and(
                  eq(productItemAttributes.productItemId, productItems.id),
                  eq(productItemAttributes.attributeId, attributeId),
                  eq(productItemAttributes.attributeValueId, valueId)
                )
              )
              .where(
                and(
                  eq(productItems.productId, products.id),
                  isNull(productItems.deletedAt)
                )
              )
          )
        );
      }
    }

    return and(...filters);
  }
}
