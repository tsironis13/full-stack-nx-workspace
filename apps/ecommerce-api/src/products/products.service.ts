import { Injectable } from '@nestjs/common';
import { asc } from 'drizzle-orm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DrizzleService } from '../drizzle/drizzle.service';
import { ProductsPaginatedPostDto } from './dto/products-paginated.post.dto';
import { products } from '../db/schema';
import { withPagination } from '@full-stack-nx-workspace/api';

@Injectable()
export class ProductsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  getAllPaginated(productsPaginatedPostDto: ProductsPaginatedPostDto) {
    const productsQuery = this.drizzleService.db.select().from(products);

    return withPagination(
      productsQuery.$dynamic(),
      asc(products.id),
      productsPaginatedPostDto.page,
      productsPaginatedPostDto.limit
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
