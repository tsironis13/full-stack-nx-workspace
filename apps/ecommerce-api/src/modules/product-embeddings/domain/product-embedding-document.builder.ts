/**
 * Builds the plain-text retrieval document for one Product (name, Category
 * path, description, about, care, options, Main Product Item sale price).
 * Documents are not instruction-prefixed; Qwen3 wraps search queries only.
 */
import type {
  ProductEmbeddingAttribute,
  ProductEmbeddingSource,
} from './product-embedding.types';
export class ProductEmbeddingDocumentBuilder {
  build(source: ProductEmbeddingSource): string {
    const lines: string[] = [`Product: ${source.name.trim()}`];

    if (source.categoryPath.length > 0) {
      lines.push(`Category: ${source.categoryPath.join(' > ')}`);
    }

    pushLabeled(lines, 'Description', source.description);
    pushLabeled(lines, 'About', source.about);
    pushLabeled(lines, 'Care', source.careInstructions);

    const options = formatAttributes(source.attributes);
    if (options) {
      lines.push(`Options: ${options}`);
    }

    if (source.salePrice != null && Number.isFinite(source.salePrice)) {
      lines.push(`Sale price: ${source.salePrice}`);
    }

    return lines.join('\n');
  }
}

function pushLabeled(
  lines: string[],
  label: string,
  value: string | null | undefined
): void {
  const trimmed = value?.trim();
  if (trimmed) {
    lines.push(`${label}: ${trimmed}`);
  }
}

function formatAttributes(attributes: ProductEmbeddingAttribute[]): string {
  const valuesByName = new Map<string, string[]>();

  for (const attribute of attributes) {
    const name = attribute.name.trim();
    const value = attribute.value.trim();
    if (!name || !value) {
      continue;
    }
    const existing = valuesByName.get(name) ?? [];
    if (!existing.includes(value)) {
      existing.push(value);
    }
    valuesByName.set(name, existing);
  }

  return [...valuesByName.entries()]
    .map(([name, values]) => `${name}: ${values.join(', ')}`)
    .join('; ');
}
