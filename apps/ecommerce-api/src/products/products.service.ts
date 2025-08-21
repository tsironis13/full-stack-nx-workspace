import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DrizzleService } from '../drizzle/drizzle.service';
import { PaginationDto } from '@full-stack-nx-workspace/pagination';

@Injectable()
export class ProductsService {
  constructor(private readonly drizzleService: DrizzleService) {}
  create(createProductDto: CreateProductDto) {
    return 'This action adds a new product';
  }

  findAll(paginationDto: PaginationDto) {
    console.log(paginationDto);
    const products1 = this.drizzleService.db.query.products.findMany();
    return products1;
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
