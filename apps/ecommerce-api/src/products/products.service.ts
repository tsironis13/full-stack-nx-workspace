import { Injectable } from '@nestjs/common';
import { desc, sql } from 'drizzle-orm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DrizzleService } from '../drizzle/drizzle.service';
import { ProductsCatalogPostDto } from './dto/products-catalog.post.dto';
import { products } from '../db/schema';
import { withPagination } from '@full-stack-nx-workspace/api';
import {
  getProductsCatalog,
  getProductsCatalogFilters,
} from './products.repository';
import { ProductsCatalogFiltersPostDto } from './dto/products-catalog-filters.post.dto';

type InputType = 'radio' | 'checkbox';

type AttributeValue = {
  value_id: number;
  value_name: string;
  product_items_count: number;
};

type GroupedAttribute = {
  attribute_id: number;
  attribute_name: string;
  attribute_input_type: InputType | null;
  values: AttributeValue[];
};

@Injectable()
export class ProductsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getPaginatedProductsCatalogFilteredBy(
    productsCatalogPostDto: ProductsCatalogPostDto
  ) {
    const productsQuery = getProductsCatalog(
      this.drizzleService,
      productsCatalogPostDto
    );

    const totalResult = await this.drizzleService.db
      .select({
        total: sql<number>`COUNT(*)`.mapWith(Number),
      })
      .from(productsQuery.as('sub'));

    const paginatedQuery = withPagination(
      productsQuery.$dynamic(),
      desc(products.id),
      productsCatalogPostDto.page,
      productsCatalogPostDto.limit
    );

    const productsResult = await paginatedQuery;

    return {
      products: productsResult,
      totalResults: totalResult[0].total,
    };
  }

  async getProductsCatalogFilters(
    productsCatalogFiltersPostDto: ProductsCatalogFiltersPostDto
  ) {
    const result = await getProductsCatalogFilters(
      this.drizzleService,
      productsCatalogFiltersPostDto
    );

    return result.reduce<GroupedAttribute[]>((acc, row) => {
      let attribute = acc.find(
        (a) => a.attribute_id === Number(row.attribute_id)
      );

      if (!attribute) {
        attribute = {
          attribute_id: Number(row.attribute_id),
          attribute_name: row.attribute_name ?? '',
          attribute_input_type: row.input_type,
          values: [],
        };
        acc.push(attribute);
      }

      attribute.values.push({
        value_id: Number(row.value_id),
        value_name: row.value_name ?? '',
        product_items_count: Number(row.product_items_count),
      });

      return acc;
    }, []);
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
