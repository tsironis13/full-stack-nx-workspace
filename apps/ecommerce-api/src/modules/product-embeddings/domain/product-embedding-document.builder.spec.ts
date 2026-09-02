import { ProductEmbeddingDocumentBuilder } from './product-embedding-document.builder';
import { formatEcommerceSearchQuery } from './qwen3-embedding.instructions';

describe('ProductEmbeddingDocumentBuilder', () => {
  const builder = new ProductEmbeddingDocumentBuilder();

  it('builds a retrieval document from Product catalog fields', () => {
    const document = builder.build({
      productId: 12,
      name: 'Framework Laptop 13',
      description: 'A lightweight laptop for programming and repairability.',
      about: 'Modular ports and a 13-inch display.',
      careInstructions: null,
      categoryPath: ['Electronics', 'Laptops'],
      attributes: [
        { name: 'RAM', value: '16GB' },
        { name: 'RAM', value: '32GB' },
        { name: 'Color', value: 'Silver' },
      ],
      salePrice: 1299,
    });

    expect(document).toBe(
      [
        'Product: Framework Laptop 13',
        'Category: Electronics > Laptops',
        'Description: A lightweight laptop for programming and repairability.',
        'About: Modular ports and a 13-inch display.',
        'Options: RAM: 16GB, 32GB; Color: Silver',
        'Sale price: 1299',
      ].join('\n')
    );
  });

  it('omits empty optional sections', () => {
    const document = builder.build({
      productId: 1,
      name: 'Trail Jacket',
      description: null,
      about: '  ',
      careInstructions: null,
      categoryPath: [],
      attributes: [{ name: ' ', value: 'Red' }],
      salePrice: null,
    });

    expect(document).toBe('Product: Trail Jacket');
  });
});

describe('formatEcommerceSearchQuery', () => {
  it('applies the Qwen3 Instruct/Query template', () => {
    expect(formatEcommerceSearchQuery('  waterproof jacket for hiking in winter  ')).toBe(
      'Instruct: Given an ecommerce search query, retrieve products that match the shopper intent\nQuery:waterproof jacket for hiking in winter'
    );
  });
});
