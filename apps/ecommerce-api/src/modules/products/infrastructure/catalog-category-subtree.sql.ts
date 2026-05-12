import { sql } from 'drizzle-orm';

import { products } from '../../../db/schema/products';

/**
 * Restricts products to those whose `category_id` falls under an **active root**
 * category subtree (`product_categories`, adjacency via `parent_category_id`).
 *
 * Anchor requires the id to be a root (`parent_category_id IS NULL`) so passing a
 * non-root id yields no matches (service layer should reject invalid roots).
 */
export function categorySubtreeIncludesRootCondition(rootCategoryId: number) {
  return sql`${products.categoryId} IN (
    WITH RECURSIVE subtree AS (
      SELECT id FROM product_categories
      WHERE id = ${rootCategoryId}
        AND deleted_at IS NULL
        AND parent_category_id IS NULL
      UNION ALL
      SELECT c.id FROM product_categories c
      INNER JOIN subtree s ON c.parent_category_id = s.id
      WHERE c.deleted_at IS NULL
    )
    SELECT id FROM subtree
  )`;
}
