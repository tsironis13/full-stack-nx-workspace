-- Product semantic-search table: 1024D pgvector embeddings (Qwen3-Embedding-0.6B).
CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE "product_embeddings" (
	"product_id" integer PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1024) NOT NULL,
	"model" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "product_embeddings" ADD CONSTRAINT "product_embeddings_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "product_embeddings_embedding_idx" ON "product_embeddings" USING hnsw ("embedding" vector_cosine_ops);
