import { Injectable } from '@nestjs/common';
import { desc } from 'drizzle-orm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DrizzleService } from '../drizzle/drizzle.service';
import { ProductsPostDto } from './dto/products.post.dto';
import { products } from '../db/schema';
import { withPagination } from '@full-stack-nx-workspace/api';
import { getProducts } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  getPaginatedFilteredBy(productsPostDto: ProductsPostDto) {
    const productsQuery = getProducts(this.drizzleService);

    return withPagination(
      productsQuery.$dynamic(),
      desc(products.id),
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
