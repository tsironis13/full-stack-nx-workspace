import { PgDialect } from 'drizzle-orm/pg-core';

import { categorySubtreeIncludesRootCondition } from './catalog-category-subtree.sql';

describe('categorySubtreeIncludesRootCondition', () => {
  it('contains a recursive CTE over product_categories for subtree semantics', () => {
    const dialect = new PgDialect();
    const fragment = categorySubtreeIncludesRootCondition(42);
    const { sql: text, params } = fragment.toQuery({
      casing: dialect.casing,
      escapeName: dialect.escapeName.bind(dialect),
      escapeParam: (num, _value) => dialect.escapeParam(num),
      escapeString: dialect.escapeString.bind(dialect),
    });
    expect(text.toLowerCase()).toContain('with recursive');
    expect(text).toContain('product_categories');
    expect(text).toContain('parent_category_id');
    expect(params).toContain(42);
  });
});
