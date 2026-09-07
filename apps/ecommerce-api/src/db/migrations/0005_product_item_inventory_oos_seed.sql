-- Honest demo stock for Cart Item workflow: keep the Main Product Item in
-- stock, and mark one other Product Item per multi-item Product as Out of
-- Stock so conversion can show both In Stock and Out of Stock combinations.
UPDATE "product_items" AS pi
SET "inventory" = 0
WHERE pi.id IN (
  SELECT DISTINCT ON ("product_id") "id"
  FROM "product_items"
  WHERE "deleted_at" IS NULL
    AND "is_main_product" = false
    AND "product_id" IN (
      SELECT "product_id"
      FROM "product_items"
      WHERE "deleted_at" IS NULL
      GROUP BY "product_id"
      HAVING COUNT(*) > 1
    )
  ORDER BY "product_id", "id" DESC
);
