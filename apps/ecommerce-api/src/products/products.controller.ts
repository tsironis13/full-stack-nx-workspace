import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsCatalogPostDto } from './dto/products-catalog.post.dto';
import { ProductsCatalogFiltersPostDto } from './dto/products-catalog-filters.post.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('/catalog/paginated') // POST /products/catalog/paginated
  getPaginatedProductsCatalogFilteredBy(
    @Body() productsCatalogPostDto: ProductsCatalogPostDto
  ) {
    return this.productsService.getPaginatedProductsCatalogFilteredBy(
      productsCatalogPostDto
    );
  }

  @Post('/catalog/filters') // POST /products/catalog/filters
  getProductsCatalogFilters(
    @Body() productsCatalogFiltersPostDto: ProductsCatalogFiltersPostDto
  ) {
    return this.productsService.getProductsCatalogFilters(
      productsCatalogFiltersPostDto
    );
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
