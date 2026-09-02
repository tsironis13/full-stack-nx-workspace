import { ProductRecommendationProjectionBuilder } from './product-recommendation-projection.builder';
import type { ProductEmbeddingSource } from './product-embedding.types';

describe('ProductRecommendationProjectionBuilder', () => {
  const builder = new ProductRecommendationProjectionBuilder();

  const source = (
    overrides: Partial<ProductEmbeddingSource> = {}
  ): ProductEmbeddingSource => ({
    productId: 42,
    name: 'Trail Shoe',
    description: 'Waterproof hiking shoe with a grippy sole.',
    about: 'Built for long days on wet trails.',
    careInstructions: 'Air dry only.',
    categoryPath: ['Footwear', 'Hiking'],
    attributes: [
      { name: 'Waterproof', value: 'Yes' },
      { name: 'Size', value: '42' },
    ],
    salePrice: 129,
    ...overrides,
  });

  it('projects catalog fields the assistant may cite', () => {
    expect(builder.build(source(), 0.81)).toEqual({
      productId: 42,
      name: 'Trail Shoe',
      similarity: 0.81,
      categoryPath: ['Footwear', 'Hiking'],
      salePrice: 129,
      storefrontPath: '/products/42',
      excerpt: 'Waterproof hiking shoe with a grippy sole.',
      options: 'Waterproof: Yes; Size: 42',
    });
  });

  it('falls back to about when description is empty and omits empty options', () => {
    expect(
      builder.build(
        source({
          description: '  ',
          attributes: [],
        }),
        0.5
      )
    ).toMatchObject({
      excerpt: 'Built for long days on wet trails.',
      options: null,
    });
  });

  it('truncates excerpts to 400 characters and never includes care instructions', () => {
    const description = `${'a'.repeat(410)} secret care`;
    const projection = builder.build(source({ description }), 0.2);

    expect(projection.excerpt).toHaveLength(400);
    expect(JSON.stringify(projection)).not.toContain('Air dry');
  });

  it('coerces string product ids to numbers on the projection', () => {
    expect(
      builder.build(source({ productId: '42' as unknown as number }), 0.1)
    ).toMatchObject({
      productId: 42,
      storefrontPath: '/products/42',
    });
  });
});
