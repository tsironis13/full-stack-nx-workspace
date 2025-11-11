import { ProductQuery, Product } from '../domain/public-api';
import { ProductDto, ProductsPostDto } from '../infrastructure/public-api';

export const productQueryModelToProductPostDto = (
  productQuery: ProductQuery
): ProductsPostDto => {
  return {
    page: productQuery.page,
    limit: productQuery.limit,
  };
};

export const productDtoToProductModel = (productDto: ProductDto): Product => {
  return {
    id: productDto.id,
    name: productDto.name,
    imageUrl: productDto.image_url,
    originalPrice: productDto.original_price,
    salePrice: productDto.sale_price,
  };
};
