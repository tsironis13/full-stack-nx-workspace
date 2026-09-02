import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const productRecommendationSchema = z.object({
  productId: z.coerce.number(),
  name: z.string(),
  similarity: z.coerce.number(),
  categoryPath: z.array(z.string()),
  salePrice: z.number().nullable(),
  storefrontPath: z.string(),
  excerpt: z.string().nullable(),
  options: z.string().nullable(),
});

function ecommerceApiBaseUrl(): string {
  const fromEnv = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process?.env?.ECOMMERCE_API_URL?.trim();
  return (fromEnv || 'http://localhost:3001/api').replace(/\/$/, '');
}

export const searchProductsByNeedTool = createTool({
  id: 'search_products_by_need',
  description:
    'Search catalog Products for a shopper product need in natural language. Returns up to 8 compact Product recommendation projections (name, category path, sale price, excerpt, options, storefront path, similarity). Use only when the shopper expresses a product need. Do not keyword-ize. Do not add constraints the shopper did not say.',
  inputSchema: z.object({
    query: z
      .string()
      .min(1)
      .describe(
        'The product need as natural language, e.g. "waterproof shoes for hiking". No Qwen Instruct prefix.',
      ),
    limit: z.number().int().min(1).max(20).optional(),
  }),
  outputSchema: z.object({
    items: z.array(productRecommendationSchema),
  }),
  execute: async ({ query, limit }, { abortSignal }) => {
    const url = new URL(`${ecommerceApiBaseUrl()}/product-embeddings/search`);
    url.searchParams.set('q', query);
    if (limit != null) {
      url.searchParams.set('limit', String(limit));
    }

    const response = await fetch(url, { signal: abortSignal });
    if (!response.ok) {
      throw new Error(
        `Product search failed with HTTP ${response.status}`,
      );
    }

    const payload = (await response.json()) as {
      items?: z.infer<typeof productRecommendationSchema>[];
    };
    return { items: payload.items ?? [] };
  },
});
