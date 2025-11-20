import {
  ProductCatalogQuery,
  Product,
  ProductCatalogFilter,
} from '../domain/public-api';
import {
  ProductDto,
  ProductsCatalogPostDto,
  ProductCatalogFilterDto,
  ProductsCatalogFiltersPostDto,
} from '../infrastructure/public-api';

export const productCatalogQueryModelToProductCatalogPostDto = (
  productQuery: ProductCatalogQuery
): ProductsCatalogPostDto => {
  return {
    page: productQuery.page,
    limit: productQuery.limit,
    categoryId: productQuery.categoryId,
    filters: productQuery.filters,
    priceRange: productQuery.priceRange,
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

export const categoryIdToProductsCatalogFiltersPostDto = (
  categoryId: number
): ProductsCatalogFiltersPostDto => {
  return {
    categoryId,
  };
};

export const productCatalogFilterDtoToProductCatalogFilterModel = (
  productCatalogFilterDto: ProductCatalogFilterDto
): ProductCatalogFilter => {
  return {
    attributeId: productCatalogFilterDto.attribute_id,
    attributeName: productCatalogFilterDto.attribute_name,
    inputType: productCatalogFilterDto.attribute_input_type,
    values: productCatalogFilterDto.values.map((value) => ({
      valueId: value.value_id,
      valueName: value.value_name,
      productItemsCount: value.product_items_count,
    })),
  };
};
