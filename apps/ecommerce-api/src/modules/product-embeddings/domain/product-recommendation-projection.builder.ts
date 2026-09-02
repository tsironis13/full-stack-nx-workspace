/**
 * Maps a Product embedding source + similarity into the compact projection
 * the Shopping Assistant may cite (no care instructions, no images).
 */
import { formatProductEmbeddingOptions } from './product-embedding-document.builder';
import type {
  ProductEmbeddingSource,
  ProductRecommendationProjection,
} from './product-embedding.types';

export const PRODUCT_RECOMMENDATION_EXCERPT_MAX_CHARS = 400;

export class ProductRecommendationProjectionBuilder {
  build(
    source: ProductEmbeddingSource,
    similarity: number
  ): ProductRecommendationProjection {
    const options = formatProductEmbeddingOptions(source.attributes);

    const productId = Number(source.productId);

    return {
      productId,
      name: source.name,
      similarity,
      categoryPath: source.categoryPath,
      salePrice: source.salePrice,
      storefrontPath: `/products/${productId}`,
      excerpt: excerptFrom(source),
      options: options || null,
    };
  }
}

function excerptFrom(source: ProductEmbeddingSource): string | null {
  const raw = source.description?.trim() || source.about?.trim();
  if (!raw) {
    return null;
  }
  return raw.length <= PRODUCT_RECOMMENDATION_EXCERPT_MAX_CHARS
    ? raw
    : raw.slice(0, PRODUCT_RECOMMENDATION_EXCERPT_MAX_CHARS);
}
