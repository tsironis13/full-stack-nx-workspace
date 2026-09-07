-- Inventory on Product Item (non-negative). Seed existing rows in stock so
-- a Product with a single Product Item can convert through Cart Item workflow.
ALTER TABLE "product_items" ADD COLUMN "inventory" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "product_items" ADD CONSTRAINT "chk_product_items_inventory_non_negative" CHECK ("inventory" >= 0);
--> statement-breakpoint
UPDATE "product_items" SET "inventory" = 10 WHERE "deleted_at" IS NULL;
