/** Persists Product vectors and nearest-neighbor search over `product_embeddings`. */
import type {
  IndexedProductEmbedding,
  ProductEmbeddingSearchHit,
} from '../product-embedding.types';

export abstract class ProductEmbeddingsRepository {
  abstract upsertMany(rows: IndexedProductEmbedding[]): Promise<void>;

  abstract searchByEmbedding(params: {
    embedding: number[];
    limit: number;
  }): Promise<ProductEmbeddingSearchHit[]>;
}
