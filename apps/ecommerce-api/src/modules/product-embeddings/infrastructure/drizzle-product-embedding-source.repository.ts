/**
 * Reads active Products, Category paths, Product Item attributes, and Main
 * Product Item sale price for the embedding document builder.
 */
import { Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';

import { attributeValues } from '../../../db/schema/attribute_values';
import { attributes } from '../../../db/schema/attributes';
import { productCategories } from '../../../db/schema/product-categories';
import { productItemAttributes } from '../../../db/schema/product_item_attributes';
import { productItems } from '../../../db/schema/product-items';
import { products } from '../../../db/schema/products';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import type {
  ProductEmbeddingAttribute,
  ProductEmbeddingSource,
} from '../domain/product-embedding.types';
import { ProductEmbeddingSourceRepository } from '../domain/repositories/product-embedding-source.repository';

type CategoryRow = {
  id: number;
  name: string | null;
  parentCategoryId: number | null;
};

@Injectable()
export class DrizzleProductEmbeddingSourceRepository extends ProductEmbeddingSourceRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async loadAll(): Promise<ProductEmbeddingSource[]> {
    return this.loadSources();
  }

  async loadByProductIds(
    productIds: number[]
  ): Promise<ProductEmbeddingSource[]> {
    if (productIds.length === 0) {
      return [];
    }
    return this.loadSources(productIds);
  }

  private async loadSources(
    productIds?: number[]
  ): Promise<ProductEmbeddingSource[]> {
    const categoryRows = await this.drizzle.db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        parentCategoryId: productCategories.parentCategoryId,
      })
      .from(productCategories)
      .where(isNull(productCategories.deletedAt));

    const categoriesById = new Map<number, CategoryRow>(
      categoryRows.map((row) => [
        asId(row.id),
        {
          id: asId(row.id),
          name: row.name,
          parentCategoryId:
            row.parentCategoryId == null ? null : asId(row.parentCategoryId),
        },
      ])
    );

    const productRows = await this.drizzle.db
      .select({
        productId: products.id,
        name: products.name,
        description: products.description,
        about: products.about,
        careInstructions: products.careInstructions,
        categoryId: products.categoryId,
      })
      .from(products)
      .where(
        productIds
          ? and(isNull(products.deletedAt), inArray(products.id, productIds))
          : isNull(products.deletedAt)
      );

    const mainItemFilter = productIds
      ? and(
          eq(productItems.isMainProduct, true),
          isNull(productItems.deletedAt),
          inArray(productItems.productId, productIds)
        )
      : and(
          eq(productItems.isMainProduct, true),
          isNull(productItems.deletedAt)
        );

    const mainItemRows = await this.drizzle.db
      .select({
        productId: productItems.productId,
        salePrice: productItems.salePrice,
      })
      .from(productItems)
      .where(mainItemFilter);

    const salePriceByProductId = new Map<number, number | null>(
      mainItemRows.map((row) => [asId(row.productId), row.salePrice])
    );

    const attributeFilter = productIds
      ? and(
          isNull(productItems.deletedAt),
          inArray(productItems.productId, productIds)
        )
      : isNull(productItems.deletedAt);

    const attributeRows = await this.drizzle.db
      .select({
        productId: productItems.productId,
        name: attributes.name,
        value: attributeValues.value,
      })
      .from(productItems)
      .innerJoin(
        productItemAttributes,
        eq(productItemAttributes.productItemId, productItems.id)
      )
      .innerJoin(
        attributes,
        eq(attributes.id, productItemAttributes.attributeId)
      )
      .innerJoin(
        attributeValues,
        eq(attributeValues.id, productItemAttributes.attributeValueId)
      )
      .where(attributeFilter);

    const attributesByProductId = new Map<number, ProductEmbeddingAttribute[]>();
    for (const row of attributeRows) {
      if (!row.name || !row.value) {
        continue;
      }
      const productId = asId(row.productId);
      const list = attributesByProductId.get(productId) ?? [];
      list.push({ name: row.name, value: row.value });
      attributesByProductId.set(productId, list);
    }

    const sources: ProductEmbeddingSource[] = [];
    for (const row of productRows) {
      const name = row.name?.trim();
      if (!name) {
        continue;
      }
      const productId = asId(row.productId);
      sources.push({
        productId,
        name,
        description: row.description,
        about: row.about,
        careInstructions: row.careInstructions,
        categoryPath: categoryPath(row.categoryId, categoriesById),
        attributes: attributesByProductId.get(productId) ?? [],
        salePrice: salePriceByProductId.get(productId) ?? null,
      });
    }

    return sources;
  }
}

function categoryPath(
  categoryId: number,
  categoriesById: Map<number, CategoryRow>
): string[] {
  const names: string[] = [];
  const seen = new Set<number>();
  let currentId: number | null =
    categoryId == null ? null : asId(categoryId);

  while (currentId != null && !seen.has(currentId)) {
    seen.add(currentId);
    const category = categoriesById.get(currentId);
    if (!category) {
      break;
    }
    if (category.name?.trim()) {
      names.unshift(category.name.trim());
    }
    currentId = category.parentCategoryId;
  }

  return names;
}

function asId(value: unknown): number {
  return Number(value);
}
