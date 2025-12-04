import { Product, ProductCatalogFilter } from '../../domain/public-api';
import { ProductFilterViewModel, ProductViewModel } from './view.model';

export const productToProductViewModel = (
  product: Product,
  quantity: number
): ProductViewModel => {
  return {
    id: product.id,
    name: product.name,
    image: {
      path: product.imageUrl,
      priority: true,
      fill: true,
    },
    originalPrice: product.originalPrice,
    salePrice: product.salePrice,
    quantity: quantity,
  };
};

export const productCatalogFilterToProductCatalogFilterViewModel = (
  productCatalogFilter: ProductCatalogFilter
): ProductFilterViewModel => {
  return {
    attributeId: productCatalogFilter.attributeId,
    attributeName: productCatalogFilter.attributeName,
    inputType: productCatalogFilter.inputType,
    values: productCatalogFilter.values.map((value) => ({
      valueId: value.valueId,
      valueName: value.valueName,
      productItemsCount: value.productItemsCount,
    })),
  };
};
