import { Injectable } from '@nestjs/common';
import { and, asc, count, eq, ne, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DrizzleService } from '../drizzle/drizzle.service';
import { ProductsPostDto } from './dto/products.post.dto';
import { products, productItems, productImages } from '../db/schema';
import { withPagination } from '@full-stack-nx-workspace/api';

@Injectable()
export class ProductsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  getPaginatedFilteredBy(productsPostDto: ProductsPostDto) {
    const productImageSubquery = this.drizzleService.db
      .select({ url: productImages.url })
      .from(productImages)
      .where(eq(productImages.productItemId, productItems.id))
      .orderBy(asc(productImages.id))
      .limit(1)
      .as('img');

    const pi2 = alias(productItems, 'pi2');

    const variationsCountSubquery = this.drizzleService.db
      .select({ variations_count: count().as('variations_count') })
      .from(pi2)
      .where(
        and(
          eq(pi2.productId, productItems.productId), // same product
          ne(pi2.id, productItems.id) // exclude self
        )
      )
      .as('variations_count');

    const productsQuery = this.drizzleService.db
      .select({
        id: products.id,
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
      .where(eq(productItems.isMainProduct, true));

    return withPagination(
      productsQuery.$dynamic(),
      asc(products.id),
      productsPostDto.page,
      productsPostDto.limit
    );
  }

  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
