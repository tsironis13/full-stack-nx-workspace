/**
 * Qwen3-Embedding Instruct/Query wrapper for shopper search text.
 * Official usage prefixes queries only; retrieval documents stay unprefixed.
 * @see https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
 */
export const QWEN3_ECOMMERCE_QUERY_TASK =
  'Given an ecommerce search query, retrieve products that match the shopper intent';

export function formatEcommerceSearchQuery(query: string): string {
  const trimmed = query.trim();
  return `Instruct: ${QWEN3_ECOMMERCE_QUERY_TASK}\nQuery:${trimmed}`;
}
