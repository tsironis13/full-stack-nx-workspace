import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, isNull, sql } from 'drizzle-orm';

import { productCategories } from '../../../db/schema/product-categories';
import { productItems } from '../../../db/schema/product-items';
import { products } from '../../../db/schema/products';
import { DrizzleService } from '../../../drizzle/drizzle.service';

import { CatalogSort } from '../domain/catalog.types';

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
  }): Promise<{ rows: CatalogListRow[]; total: number }> {
    const { page, pageSize, sort, q, categoryRootId } = params;
    const offset = (page - 1) * pageSize;

    const joinMainItem = and(
      eq(productItems.productId, products.id),
      eq(productItems.isMainProduct, true),
      isNull(productItems.deletedAt)
    );

    const filters = [isNull(products.deletedAt)];
    const trimmed = q?.trim();
    if (trimmed) {
      filters.push(ilike(products.name, `%${trimmed}%`));
    }
    if (categoryRootId !== undefined) {
      filters.push(categorySubtreeIncludesRootCondition(categoryRootId));
    }

    const whereClause = and(...filters);

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
}
