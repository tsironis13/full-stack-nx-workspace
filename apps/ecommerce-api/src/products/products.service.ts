import { Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';

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
    const productsQuery = this.drizzleService.db
      .select({
        id: products.id,
        sku: productItems.sku,
        category_id: products.categoryId,
        name: products.name,
        description: products.description,
        original_price: productItems.originalPrice,
        sale_price: productItems.salePrice,
        image_url: productImages.url,
        variations_count: sql<number>`
      (SELECT COUNT(*)
       FROM ${productItems} product_items
       WHERE product_items.product_id = ${products.id}
         AND product_items.id <> ${productItems.id})`,
      })
      .from(products)
      .innerJoin(productItems, eq(products.id, productItems.productId))
      .innerJoin(
        productImages,
        eq(productItems.id, productImages.productItemId)
      )
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
