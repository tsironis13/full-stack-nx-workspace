/**
 * Reads active Products, Category paths, Product Item attributes, and Main
 * Product Item sale price for the embedding document builder.
 */
import { Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

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
    const categoryRows = await this.drizzle.db
      .select({
        id: productCategories.id,
        name: productCategories.name,
        parentCategoryId: productCategories.parentCategoryId,
      })
      .from(productCategories)
      .where(isNull(productCategories.deletedAt));

    const categoriesById = new Map<number, CategoryRow>(
      categoryRows.map((row) => [row.id, row])
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
      .where(isNull(products.deletedAt));

    const mainItemRows = await this.drizzle.db
      .select({
        productId: productItems.productId,
        salePrice: productItems.salePrice,
      })
      .from(productItems)
      .where(
        and(
          eq(productItems.isMainProduct, true),
          isNull(productItems.deletedAt)
        )
      );

    const salePriceByProductId = new Map<number, number | null>(
      mainItemRows.map((row) => [row.productId, row.salePrice])
    );

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
      .where(isNull(productItems.deletedAt));

    const attributesByProductId = new Map<number, ProductEmbeddingAttribute[]>();
    for (const row of attributeRows) {
      if (!row.name || !row.value) {
        continue;
      }
      const list = attributesByProductId.get(row.productId) ?? [];
      list.push({ name: row.name, value: row.value });
      attributesByProductId.set(row.productId, list);
    }

    const sources: ProductEmbeddingSource[] = [];
    for (const row of productRows) {
      const name = row.name?.trim();
      if (!name) {
        continue;
      }
      sources.push({
        productId: row.productId,
        name,
        description: row.description,
        about: row.about,
        careInstructions: row.careInstructions,
        categoryPath: categoryPath(row.categoryId, categoriesById),
        attributes: attributesByProductId.get(row.productId) ?? [],
        salePrice: salePriceByProductId.get(row.productId) ?? null,
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
  let currentId: number | null = categoryId;

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
