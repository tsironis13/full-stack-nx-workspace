---
status: accepted
date: 2026-06-07
---

# Product Reviews are Product-scoped, verified-purchase only, and drive catalog rating UX

Shoppers submit **Reviews** (required 1–5 star **Rating**, optional text) against a **Product**, not a **Product Item**. Only **Registered Users** with a **verified purchase** — at least one **`confirmed`** **Order** containing an **Order Item** for a **Product Item** belonging to that **Product** — may submit, edit, or soft-delete their review. **Guest Users** cannot review, even when they checked out with email only. We chose this over open reviews (any signed-in user), **Product Item**-level scores, or guest review flows because catalog cards, **Highest rated** sort, and the minimum-rating filter are **Product**-scoped today; verified purchase reduces fake reviews; and guest checkout deliberately has no durable account to attach authorship to (see ecommerce ADR [0002-guest-checkout-email-only-identity](./0002-guest-checkout-email-only-identity.md)).

Each user may author at most one **Review** per **Product** (editable; soft-delete by author or hide by **Admin User** — both exclude the review from the storefront aggregate while retaining the row). The public **Product** score is the exact average of non-hidden review stars; the storefront displays one decimal rounded, but sort and filter use the exact value. **Products** with no reviews show no stars on cards, fail any minimum-rating filter, and sort after rated products under **Highest rated**. Author display is **first name + last initial**, snapshotted at submit/edit, with **Verified buyer** as fallback. Submit/edit entry points are the product detail page and order history.

## Considered Options

- **Product-scoped aggregate (chosen)** — one public score per catalog product; aligns with listing cards and deferred catalog v1 sort/filter.
- **Product Item-scoped ratings** — finer granularity but forces ambiguous aggregation on cards and contradicts **Main Product Item**-centric listings.
- **Any Registered User may review** — simpler eligibility but easy to game; rejected.
- **Guest reviews after guest checkout** — requires post-checkout identity or email verification; rejected for v1 given email-only guest identity.
- **Verified purchase after delivery** — stronger trust signal but **Shipment** delivered-state is not defined in v1; **`confirmed`** **Order** is the gate for now.
- **Multiple reviews per user per product (one per order)** — rejected; repeat buyers would skew aggregates and clutter the product page.

## Consequences

- **`ecommerce-api`** owns review CRUD, aggregates, and catalog query changes; **`business-portal-api`** needs admin hide (and list) endpoints for **`business-portal`**.
- Order-history and product-detail UIs must share the same eligibility and one-review-per-product rules.
- Catalog queries gain aggregate rating computation (or a maintained summary — implementation choice left open).
- Changing to post-delivery eligibility or **Product Item** ratings later requires a migration and catalog UX rework — treat this ADR as the boundary until explicitly superseded.
