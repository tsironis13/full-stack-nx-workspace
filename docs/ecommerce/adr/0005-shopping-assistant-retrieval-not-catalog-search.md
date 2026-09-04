---
status: accepted
date: 2026-09-02
---

# Shopping Assistant retrieval is not storefront catalog search

Need-language **Product** discovery (“waterproof shoes for hiking”) is a **Shopping Assistant** capability: `ecommerce-api` owns ranking and returns a compact **Product recommendation** projection over HTTP; the Mastra agent is a client with one search-by-need tool. We did **not** extend `GET /products/catalog?q=` or the storefront search box, because catalog v1 search is **`products.name`** only, embedding inference on every catalog keystroke is the wrong cost model, and mixing facet pagination with nearest-neighbor ranking would blur **Product** listing contracts.

## Considered Options

- **Dedicated assistant retrieval HTTP (chosen)** — Nest use case stays the only ranking path; catalog `q` unchanged; chat is the shopper entry.
- **Replace or twin catalog `q` with embeddings** — One public search, but it changes catalog v1 and invites embedding load on browse.
- **ai-server queries Postgres / LM Studio itself** — Duplicates catalog ownership and the Nest use case.
- **Shared Nx lib imported by Mastra and Nest** — Same ranking code, still splits infra (DB, embeddings) across apps.

## Consequences

- Storefront catalog search remains name-only until a later, explicit catalog decision.
- The assistant route is unauthenticated like other catalog reads; it is not wired into the search box.
- **Product recommendations** stay **Product**-scoped (listing **Sale Price** on the **Main Product Item**).
