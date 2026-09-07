/**
 * Loads a Product and its Product Items (options, Sale Price, Inventory, image)
 * for Cart Item workflow conversion. Not catalog `q`.
 */
import { Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';

import { attributeValues } from '../../../db/schema/attribute_values';
import { attributes } from '../../../db/schema/attributes';
import { productImages } from '../../../db/schema/product-images';
import { productItemAttributes } from '../../../db/schema/product_item_attributes';
import { productItems } from '../../../db/schema/product-items';
import { products } from '../../../db/schema/products';
import { DrizzleService } from '../../../drizzle/drizzle.service';
import type {
  ConversionOption,
  ConversionProduct,
  ConversionProductItem,
} from '../domain/product-item-conversion.types';
import { ProductItemConversionRepository } from '../domain/repositories/product-item-conversion.repository';

@Injectable()
export class DrizzleProductItemConversionRepository extends ProductItemConversionRepository {
  constructor(private readonly drizzle: DrizzleService) {
    super();
  }

  async findByProductId(productId: number): Promise<ConversionProduct | null> {
    const [product] = await this.drizzle.db
      .select({
        id: products.id,
        name: products.name,
      })
      .from(products)
      .where(and(eq(products.id, productId), isNull(products.deletedAt)))
      .limit(1);

    if (!product) {
      return null;
    }

    const itemRows = await this.drizzle.db
      .select({
        id: productItems.id,
        salePrice: productItems.salePrice,
        originalPrice: productItems.originalPrice,
        inventory: productItems.inventory,
        imageUrl: sql<string | null>`(
          select pi.url from ${productImages} pi
          where pi.product_item_id = ${productItems.id}
          and pi.deleted_at is null
          order by pi.id asc
          limit 1
        )`,
      })
      .from(productItems)
      .where(
        and(
          eq(productItems.productId, productId),
          isNull(productItems.deletedAt),
        ),
      )
      .orderBy(asc(productItems.id));

    const itemIds = itemRows.map((row) => Number(row.id));
    const optionsByItemId = await this.loadOptions(itemIds);

    const items: ConversionProductItem[] = itemRows.map((row) => {
      const id = Number(row.id);
      return {
        id,
        options: optionsByItemId.get(id) ?? [],
        salePrice: row.salePrice,
        originalPrice: row.originalPrice,
        inventory: row.inventory,
        imageUrl: row.imageUrl,
      };
    });

    return {
      id: Number(product.id),
      name: product.name,
      items,
    };
  }

  private async loadOptions(
    itemIds: number[],
  ): Promise<Map<number, ConversionOption[]>> {
    const byItem = new Map<number, ConversionOption[]>();
    if (itemIds.length === 0) {
      return byItem;
    }

    const rows = await this.drizzle.db
      .select({
        productItemId: productItemAttributes.productItemId,
        name: attributes.name,
        value: attributeValues.value,
      })
      .from(productItemAttributes)
      .innerJoin(
        attributes,
        eq(attributes.id, productItemAttributes.attributeId),
      )
      .innerJoin(
        attributeValues,
        eq(attributeValues.id, productItemAttributes.attributeValueId),
      )
      .where(inArray(productItemAttributes.productItemId, itemIds));

    for (const row of rows) {
      if (row.productItemId == null || !row.name || !row.value) {
        continue;
      }
      const productItemId = Number(row.productItemId);
      const list = byItem.get(productItemId) ?? [];
      list.push({ name: row.name, value: row.value });
      byItem.set(productItemId, list);
    }
    return byItem;
  }
}
