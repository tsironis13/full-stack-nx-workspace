CREATE TABLE "product_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" smallint NOT NULL,
	"title" text,
	"body" text,
	"author_display_name" text NOT NULL,
	"hidden_at" timestamp,
	"hidden_by" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "chk_product_reviews_rating_range" CHECK ("product_reviews"."rating" >= 1 AND "product_reviews"."rating" <= 5)
);
--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "one_review_per_user_per_product" ON "product_reviews" USING btree ("product_id","user_id");--> statement-breakpoint
CREATE INDEX "product_reviews_product_id_visible_idx" ON "product_reviews" USING btree ("product_id") WHERE "hidden_at" is null;
