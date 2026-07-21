# PRD: Product Reviews and Ratings

<!-- Source: domain-modeling-overlay session + docs/ecommerce/CONTEXT.md + docs/ecommerce/adr/0001-product-reviews-and-verified-purchase.md. Publish with: gh issue create --title "PRD: Product Reviews and Ratings" --body-file docs/ecommerce/prd-product-reviews-and-ratings.md --label Sandcastle -->

## Problem Statement

Shoppers using the **`ecommerce`** storefront can browse the **Product** catalog but cannot see or contribute trustworthy social proof: there is no **Review** or **Rating** data, no product-page review list, and catalog v1 deliberately omitted stars, **Highest rated** sort, and minimum-rating filters. **Registered Users** who completed a **`confirmed`** **Order** have no way to share feedback; **Guest Users** correctly cannot review under domain rules but the platform also lacks the eligibility and moderation model to prevent fake reviews. **Admin Users** in **`business-portal`** cannot hide abusive **Reviews**. Without aligning implementation to **`docs/ecommerce/CONTEXT.md`** and ADR **`docs/ecommerce/adr/0001-product-reviews-and-verified-purchase.md`**, the team risks shipping **Product Item**-level scores, guest reviews, or catalog UX that contradicts the glossary.

## Solution

Deliver **Product**-scoped **Reviews** (required 1–5 star **Rating**, optional title/body) backed by **`ecommerce-api`**, surfaced in **`ecommerce`** on the product detail page and catalog, with **verified purchase** gating for **Registered Users** only. Extend the existing catalog module to support average **Rating** on cards, **Highest rated** sort, and a minimum-rating filter using the **exact** average for logic and one-decimal rounded display. Provide submit/edit/soft-delete on the product page and from **order history** for eligible buyers. Add **`business-portal-api`** + **`business-portal`** capabilities for **Admin Users** to hide **Reviews**. Domain language remains authoritative in **`docs/ecommerce/CONTEXT.md`**; architectural boundary in **`docs/ecommerce/adr/0001-product-reviews-and-verified-purchase.md`**.

---

## User Stories

### Storefront — reading reviews

1. As a **Guest User**, I want to see average **Rating** and **review count** on catalog cards when a **Product** has **Reviews**, so that I can compare social proof while browsing.
2. As a **Guest User**, I want catalog cards for **Products** with no **Reviews** to show no star score, so that unrated items are not misrepresented as 0★.
3. As a **Guest User**, I want to open a **Product** detail page and see the aggregate score (one decimal) and total review count when reviews exist, so that I understand overall sentiment.
4. As a **Guest User**, I want to see “No reviews yet” on a **Product** with no **Reviews**, so that the absence of data is clear.
5. As a **Guest User**, I want to read a paginated list of **Reviews** on the product page (stars, snapshotted author as **first name + last initial** or **Verified buyer**, date, optional text), so that I can read shopper feedback.
6. As a **Guest User**, I want **Reviews** with stars only (no written content) to appear in the list with stars and author/date, so that star-only submissions still contribute visible feedback.
7. As a **Guest User**, I want hidden or soft-deleted **Reviews** excluded from the list and aggregate, so that moderated or withdrawn content does not appear.
8. As a shopper, I want catalog sort **Highest rated** to order **Products** by exact average **Rating** descending, so that well-reviewed items surface first.
9. As a shopper, I want **Products** with no **Reviews** to appear after all rated **Products** when **Highest rated** is selected, so that unrated inventory is still discoverable.
10. As a shopper, I want a minimum-rating filter (e.g. 4★ and up) that uses the exact average, so that a **Product** at 3.8★ does not appear in a 4★ filter.
11. As a shopper, I want **Products** with no **Reviews** excluded when any minimum-rating filter is active, so that the filter is meaningful.
12. As a shopper using assistive technology, I want star ratings exposed with meaningful labels, so that review content is accessible.

### Storefront — writing reviews

13. As a **Registered User** with a **verified purchase** of a **Product**, I want to submit a **Review** with required stars and optional title/body from the product page, so that I can share feedback where I discovered the item.
14. As a **Registered User** with a **verified purchase**, I want to submit or edit a **Review** from **order history** for eligible **Products** in **`confirmed`** **Orders**, so that I can review after purchase without hunting for the product page.
15. As a **Registered User** without a **verified purchase**, I want clear messaging that I cannot review a **Product**, so that I understand the rule.
16. As a **Registered User**, I want at most one **Review** per **Product**, so that my voice is not duplicated.
17. As a **Registered User**, I want to **edit** my existing **Review** (stars and/or text), so that I can correct mistakes or update my opinion.
18. As a **Registered User**, I want to soft-**delete** my **Review**, so that it disappears from the storefront and no longer affects the aggregate.
19. As a **Registered User**, I want my public author label snapshotted as **first name + last initial** at submit/edit, so that later profile renames do not rewrite history unless I edit the review.
20. As a **Registered User** whose profile has no usable name, I want my review to show **Verified buyer**, so that anonymity is preserved without faking a name.
21. As a **Guest User**, I want review submission controls hidden or gated with sign-in, so that **Guest Users** cannot submit **Reviews** even if they previously guest-checked out.
22. As a **Registered User**, I want validation errors when **Rating** is outside 1–5 or required stars are missing, so that invalid submissions are rejected clearly.

### Order history (new capability)

23. As a **Registered User**, I want to view my past **`confirmed`** **Orders** and their **Order Items**, so that I can find **Products** I bought.
24. As a **Registered User**, I want each eligible **Product** in order history to show **Write a review** or **Edit review** based on whether I already have a **Review**, so that entry points match ADR rules.
25. As a **Registered User**, I want order history review actions to use the same eligibility rules as the product page, so that behavior is consistent.

### Catalog integration

26. As a shopper, I want **Highest rated** added to the existing catalog sort control alongside **Newest** and **Price**, so that sort options match **`docs/ecommerce/CONTEXT.md`**.
27. As a shopper, I want a minimum-rating filter control alongside existing category, price, and attribute facets, so that I can narrow by social proof.
28. As a shopper, I want rating filter and sort to compose with search, category, price, and attribute filters, so that reviews integrate with catalog v1 behavior.
29. As a shopper, I want displayed averages rounded to one decimal while sort/filter use exact values, so that UI is friendly without borderline mis-ranking.

### Admin moderation

30. As an **Admin User**, I want to list **Reviews** in **`business-portal`**, so that I can find content to moderate.
31. As an **Admin User**, I want to **hide** any **Review** from the storefront, so that abusive content is removed from shopper view.
32. As an **Admin User**, I want hidden **Reviews** excluded from aggregates and lists like author soft-deletes, so that moderation takes effect immediately.
33. As an **Admin User**, I want hidden **Reviews** retained in the database, so that audit and support remain possible.

### API and domain integrity

34. As a developer, I want **verified purchase** enforced server-side by checking **`confirmed`** **Orders** with **Order Items** whose **Product Item** belongs to the target **Product**, so that clients cannot bypass eligibility.
35. As a developer, I want **`pending`** and **`cancelled`** **Orders** to fail verification, so that cancelled purchases do not grant review rights.
36. As a developer, I want **Review** mutations authenticated via existing **`auth`** / Supabase guards on **`ecommerce-api`**, so that auth stays centralized.
37. As a developer, I want catalog list queries extended in the existing **`products`** module rather than a parallel list endpoint, so that cards, facets, sort, and filters stay cohesive.
38. As a developer, I want **`ecommerce-api`** review logic in a dedicated feature module following Presentation → Application → Domain → Infrastructure per **`docs/nestjs-architecture.md`**, so that use cases stay testable.
39. As a developer, I want **`business-portal-api`** admin review endpoints separate from storefront routes, so that **`CONTEXT-MAP`** API boundaries are respected.
40. As a developer, I want duplicate **Review** submission to return a conflict or route to edit semantics, so that one-review-per-user-per-product is enforced at the database or application layer.

### Angular structure

41. As a developer, I want a **`reviews`** (or **`product`**) vertical slice under **`ecommerce`** `domains/` with `application/` store or facade, `infrastructure/` HTTP, and `feat-*` UI, so that **`eslint-plugin-boundaries`** stays green.
42. As a developer, I want catalog **`domains/catalog`** extended for rating display, sort, and filter without duplicating list HTTP, so that **`catalog-browse.store`** remains the catalog orchestrator.
43. As a developer, I want an **`orders`** or **`account`** domain slice for **order history** with review CTAs, so that the second entry point in the ADR is implemented.
44. As a developer, I want new strings extractable under locale **`el-GR`**, so that i18n stays consistent with **`ecommerce`**.

### Testing and operations

45. As a developer, I want unit tests on review eligibility, aggregate math, and hide semantics in **`ecommerce-api`**, mirroring **`place-order.use-case.spec.ts`** style.
46. As a developer, I want catalog list tests updated for **`rating_desc`** sort and **`minRating`** filter in **`catalog-list.service.spec.ts`**.
47. As a developer, I want Angular tests on review form validation and catalog card rating display, so that regressions are caught by **`nx test ecommerce`**.
48. As a maintainer, I want a Drizzle migration for the **Review** table and indexes on **`product_id`**, **`user_id`**, and aggregate query paths, so that catalog performance remains acceptable.

---

## Implementation Decisions

**Nx and ownership**

- Primary: **`ecommerce`**, **`ecommerce-api`**.
- Admin moderation: **`business-portal`**, **`business-portal-api`** (currently a minimal scaffold — first real feature module for reviews moderation).
- Shared: **`auth`**, **`auth-web`** for **Registered User** guards; extend only if profile name fields need normalization for author snapshots.
- No new shared **`libs/`** required for v1 unless review DTOs must be shared across two Angular apps — prefer **`ecommerce`** local models first.

**Domain model (authoritative: `docs/ecommerce/CONTEXT.md`, ADR 0001)**

- **Review** belongs to one **Product** and one **Registered User**; includes **Rating** (1–5 integer stars), optional `title`, optional `body`, snapshotted `authorDisplayName`, timestamps, soft-hide timestamp(s).
- **Verified purchase**: EXISTS **`confirmed`** **Order** for `user_id` with **Order Item** → **Product Item** → `product_id`.
- Public aggregate: `AVG(rating)` and `COUNT(*)` over non-hidden **Reviews** per **Product**; display `ROUND(avg, 1)`, sort/filter use full precision.
- Author hide and admin hide share storefront effect (excluded from list + aggregate); distinguish internally if needed for audit (`hidden_by` enum: `author` | `admin`).

**Persistence (`ecommerce-api`, Drizzle migration)**

Prototype table shape (decision-rich fragment):

```ts
export const productReviews = pgTable(
  'product_reviews',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    userId: uuid('user_id').notNull(),
    rating: smallint('rating').notNull(), // 1–5, CHECK in migration
    title: text('title'),
    body: text('body'),
    authorDisplayName: text('author_display_name').notNull(),
    hiddenAt: timestamp('hidden_at'),
    hiddenBy: text('hidden_by'), // 'author' | 'admin'
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [uniqueIndex('one_review_per_user_per_product').on(t.productId, t.userId)],
);
```

- Index `(product_id) WHERE hidden_at IS NULL` for list + aggregate.
- Optional later: materialized `product_rating_summary` — not required for v1 if SQL aggregate in catalog query is acceptable.

**`ecommerce-api` — new `reviews` module**

| Layer          | Responsibility                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| Presentation   | HTTP controllers, DTOs, auth guards                                                                  |
| Application    | Submit/edit/delete review use cases; list reviews; eligibility query; verified-purchase checker port |
| Domain         | Review entity rules (rating range, hide semantics)                                                   |
| Infrastructure | Drizzle repository; join `orders` / `order_items` / `product_items` for verification                 |

**Storefront HTTP contracts (`ecommerce-api`)**

- `GET /products/:productId/reviews?page&pageSize` — public list + `{ averageRating, reviewCount }` summary (exact average in payload; client may round for display).
- `GET /products/:productId/reviews/me` — authenticated; current user's review or 404.
- `POST /products/:productId/reviews` — body `{ rating, title?, body? }`; 403 if not verified; 409 if review exists.
- `PATCH /products/:productId/reviews/me` — edit; refreshes `authorDisplayName` snapshot from profile.
- `DELETE /products/:productId/reviews/me` — author soft hide.
- `GET /orders` — authenticated list of **Registered User**'s **Orders** with line items including `productId`, `productName`, and review status (`canReview`, `hasReview`, `reviewId`) for **`confirmed`** orders.

**`ecommerce-api` — extend existing `products` / catalog module**

- Add `CatalogSort.rating_desc = 'rating_desc'`.
- Add query param `minRating` (number 1–5).
- Extend `CatalogListItemDto` with `averageRating: number | null`, `reviewCount: number`.
- Repository: LEFT JOIN aggregate subquery or correlated subselect on non-hidden reviews; filter `HAVING avg >= minRating` when set; sort by exact average DESC with unrated last.

**`business-portal-api`**

- New `reviews` module (or admin submodule): `GET /reviews` (paginated, filter by product, hidden state), `POST /reviews/:id/hide` (admin soft hide). Auth restricted to **Admin User** role per existing portal auth pattern.

**Angular — `ecommerce`**

| Slice                                        | Work                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `domains/catalog`                            | Card stars + count; toolbar sort option **Highest rated**; rating threshold filter; extend `catalog-api.model` / mapper                    |
| `domains/reviews` (new) or `domains/product` | Product detail page with review list, aggregate, submit/edit/delete form; `reviews-api.service`                                            |
| `domains/orders` or `domains/account` (new)  | Order history page with review CTAs; routes under authenticated shell                                                                      |
| `auth-web`                                   | Gate write actions; surface profile name for snapshot (derive first name + last initial client-side or accept server snapshot on response) |

- Product detail routing does not exist today — add lazy route (e.g. `/products/:id`) as part of this work.
- Cross-domain: catalog does not own review writes; reviews domain owns mutations. Catalog only reads aggregates from list API.

**Author snapshot**

- On submit/edit, server reads **Registered User** profile (Supabase `user_metadata` or `GET /auth/profile` fields — align with whatever `req.user` exposes) and computes `authorDisplayName` as `"First L."` or `"Verified buyer"`.

**ADR alignment**

- Follow **`docs/ecommerce/adr/0001-product-reviews-and-verified-purchase.md`**; guest checkout identity ADR **`docs/ecommerce/adr/0002-guest-checkout-email-only-identity.md`** explains why guests cannot review.

---

## Testing Decisions

**What good tests prove**

- Eligibility: verified purchase true only for **`confirmed`** orders linking to **Product** via **Product Item**; false for guests, unsigned, pending/cancelled orders, never-purchased SKUs.
- One review per user per product enforced.
- Hide (author and admin) removes from list and lowers aggregate/count.
- Aggregate: exact average for sort/filter; display rounding is presentation-only.
- Catalog: `rating_desc` orders rated before unrated; `minRating` excludes unrated and below-threshold.

**Nx projects**

- **`ecommerce-api`**: unit specs for review use cases (mirror **`place-order.use-case.spec.ts`**); extend **`catalog-list.service.spec.ts`** and repository SQL tests if present.
- **`ecommerce`**: component/store specs for review form and catalog card rating; order history CTA states.
- **`business-portal-api`**: admin hide use case spec when module exists.
- Optional e2e: smoke submit review → appears on product page → hide as admin → absent from aggregate.

**Prior art**

- Nest: **`apps/ecommerce-api/src/modules/orders/application/use-cases/place-order.use-case.spec.ts`**, cart use case specs.
- Catalog: **`catalog-list.service.spec.ts`**, **`catalog-category-subtree.sql.spec.ts`**.
- Angular: **`catalog-browse.store`**, **`checkout.store.spec.ts`**, **`cart-page.component.spec.ts`**.

---

## Out of Scope

- **Product Item**-level ratings or per-SKU public scores.
- **Guest User** **Reviews** or post-guest-checkout account linking.
- **Verified purchase** gated on delivery / **Shipment** status (v1 uses **`confirmed`** **Order** only).
- Multiple **Reviews** per user per **Product** (one per order).
- Admin **restore** of hidden **Reviews**.
- **Most popular** sort.
- Editorial **Testimonial** content not tied to **Reviews**.
- Review helpfulness votes, reporting workflow, or ML moderation.
- Email notifications prompting review after purchase.
- URL serialization of catalog rating filter (catalog v1 URL rule unchanged).
- **`store`** lib changes unless a second storefront app immediately consumes the same review UI.

---

## Further Notes

- Update **`features/ecommerce-catalog.md`** when implementation lands so overview docs match **Highest rated** and rating filter behavior.
- **`docs/ecommerce/db-structure.md`** lists “Product reviews” under future expansion — align with migration when built.
- Performance: if catalog aggregate JOIN is slow at scale, document follow-up for summary table in a later ADR; not a v1 blocker.
- Conflict resolution: if author soft-deletes then tries to submit again, treat as new submission only if business allows re-review after delete — **default: soft-deleted row blocks unique index; author must contact support OR implementation clears `hidden_at` on resubmit** — recommend **resubmit reactivates** same row (clears `hidden_at`, updates content) to honor one-review-per-product without orphan rows.
