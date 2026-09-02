/** Shared types for building, storing, and searching Product embeddings. */
export type ProductEmbeddingAttribute = {
  name: string;
  value: string;
};

/** Catalog fields used to build one Product retrieval document. */
export type ProductEmbeddingSource = {
  productId: number;
  name: string;
  description: string | null;
  about: string | null;
  careInstructions: string | null;
  /** Category names from Root Category down to the Product's Category. */
  categoryPath: string[];
  attributes: ProductEmbeddingAttribute[];
  /** Sale Price on the Main Product Item, when present. */
  salePrice: number | null;
};

export type ProductEmbeddingSearchHit = {
  productId: number;
  name: string | null;
  similarity: number;
};

export type IndexedProductEmbedding = {
  productId: number;
  content: string;
  embedding: number[];
  model: string;
};
