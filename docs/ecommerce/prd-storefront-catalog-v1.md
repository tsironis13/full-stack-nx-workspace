# PRD: E-commerce storefront catalog (v1)

<!-- Source: to-prd skill + grilled decisions in docs/ecommerce/CONTEXT.md. Publish to GitHub with: gh issue create --title "PRD: E-commerce storefront catalog (browse, search, filters, sort, pagination)" --body-file docs/ecommerce/prd-storefront-catalog-v1.md --label Sandcastle -->

## Problem Statement

Shoppers using the **ecommerce** storefront cannot yet browse the **Product** catalog in a way that matches the domain model and everyday commerce expectations: discovering **Products** quickly, narrowing by **Category**, **Sale Price** (via **Main Product Item**), and attribute facets (size, color, etc. on **Product Items**), searching by **Product** name, sorting, and paginating—all while respecting **Guest User** vs **Registered User** rules for **Cart** and **Wishlist**. Without a coherent catalog experience aligned with `docs/ecommerce/CONTEXT.md`, discovery is fragmented and implementation risks contradicting glossary decisions (for example **Product** vs **Product Item**, **Main Product Item** for list pricing, and deferred **Rating**).

## Solution

Deliver a **responsive storefront catalog** in the **`ecommerce`** Angular app backed by **`ecommerce-api`**, implementing the v1 rules already captured in **`docs/ecommerce/CONTEXT.md`**: grid/list browsing with **Main Product Item** driving card image and **Sale Price**; **Root Category** facet with subtree inclusion; **products.name**-only search; **Newest** and **Price** sort on defined fields; **Main Product Item Sale Price** for price range; **dynamic attribute facets** derived from the current result set; **Cart** and **Wishlist** quick actions from the grid using the **Main Product Item** where applicable, with **Wishlist** persistence only for **Registered Users** and auth gating for guests; client-side catalog state **without URL serialization** requirement for v1; **no** star ratings or rating filters until rating is in scope. Customer-facing copy uses **options** / **more options**, not “variant.”

Domain language and relationships remain authoritative in **`docs/ecommerce/CONTEXT.md`**; this PRD does not replace that glossary.

---

## User Stories

1. As a **Guest User**, I want to open the catalog page, so that I can browse **Products** without signing in.
2. As a **Guest User**, I want to see **Products** in a responsive grid, so that I can scan many items on desktop, tablet, and mobile.
3. As a **Guest User**, I want each card to show the primary image aligned with the **Main Product Item**, so that what I see matches the default purchasable option.
4. As a **Guest User**, I want to see **Product** name and **Sale Price** from the **Main Product Item** on the card, so that price matches sort and filters.
5. As a **Guest User**, I want a short indication of other **options** (for example color swatches or “+N options”), so that I know there are more **Product Items** without using internal jargon in copy.
6. As a **Guest User**, I want to add the **Main Product Item** to my **Cart** from the grid, so that I can shop with minimal friction.
7. As a **Guest User**, I want to adjust quantity or change **Product Item** on the product detail page later, so that I am not locked into the default forever.
8. As a **Guest User**, I want a visible wishlist affordance on cards, so that I understand the feature exists.
9. As a **Guest User**, I want attempting to save a wishlist to prompt sign-in or registration, so that **Wishlist** rules for **Registered Users** are enforced.
10. As a **Registered User**, I want to add the **Main Product Item** to my **Wishlist** from the grid, so that my saved item matches what the card displayed.
11. As a **Registered User**, I want wishlist actions to persist after sign-in, so that I can return to saved **Products** / **Product Items** later.
12. As a shopper, I want to type in a catalog search field, so that I can narrow **Products** by **`products.name`**.
13. As a shopper, I want search to combine with active filters, so that I can refine large catalogs incrementally.
14. As a shopper, I want a clear empty state when search returns no **Products**, so that I know what happened and what to try next.
15. As a shopper, I want to filter by **Root Category**, so that I can shop within a top-level department.
16. As a shopper, when I pick a **Root Category**, I want results to include **Products** assigned to that **Category** or any **Child Category** under it, so that subtree inclusion matches the domain rule.
17. As a shopper, I want to optionally narrow to a specific nested **Category** when the UX provides it, so that I can refine within a subtree.
18. As a shopper, I want to set a minimum and maximum **Sale Price** range, so that I only see **Products** whose **Main Product Item** **Sale Price** falls in the range.
19. As a shopper, I want price range to behave consistently with the price shown on the card, so that I do not see mismatches versus **Main Product Item** pricing.
20. As a shopper, I want size and color (and similar) filters to show only values that still exist on **Product Items** in the **current** **Product** result set, so that facets stay relevant (dynamic facets).
21. As a shopper, I want facet option lists to update after I change **Category**, search, or price range, so that impossible combinations do not mislead me.
22. As a shopper, I want to sort by **Newest** using **`products.created_at`**, so that recent **Products** surface predictably.
23. As a shopper, I want to sort by **Price** low-to-high and high-to-low using **Main Product Item** **Sale Price**, so that ordering matches listing pricing.
24. As a shopper, I want pagination controls with current page and page size, so that I can move through large catalogs.
25. As a shopper, I want a “Showing X–Y of Z **Products**” style summary, so that I understand scope and progress.
26. As a shopper on mobile, I want filters accessible via drawer or modal, so that the grid stays usable on small screens.
27. As a shopper on tablet, I want balanced column counts and spacing, so that the layout uses space well.
28. As a shopper, I want keyboard-focusable controls for filters, search, sort, and pagination, so that I can use the catalog without a pointer.
29. As a shopper using assistive technology, I want meaningful labels on filter groups and sort options, so that I can navigate the catalog accessibly.
30. As a shopper, I want loading indicators during search and filter changes, so that I know the system is working.
31. As a shopper, I want graceful handling when the API fails, so that I see a recoverable error state instead of a broken page.
32. As a **Registered User**, I want catalog interactions to respect my session, so that **Cart** and **Wishlist** integrate with authenticated flows.
33. As a storefront stakeholder, I want only **Active Product** visibility rules applied in queries, so that **Archived Product** records do not appear in the shopper catalog (per domain lifecycle).
34. As a developer, I want catalog list responses to include enough data to render cards (including **Main Product Item** pricing and primary imagery pointers), so that the client does not guess pricing.
35. As a developer, I want facet endpoints or query parameters designed for **dynamic** facets, so that the client can populate filter UI from server data tied to **Product Item** attributes where the schema supports it.
36. As a developer, I want boundary-friendly Angular structure (`domains/<domain>/` features, `application/` facades or stores, `infrastructure/` HTTP) per **`docs/front-end-infrastructure.md`**, so that **eslint-plugin-boundaries** stays green in **`ecommerce`**.
37. As a developer, I want **`ecommerce-api`** to follow Presentation → Application → Domain → Infrastructure with Drizzle behind repositories per **`docs/nestjs-architecture.md`**, so that catalog use cases stay testable.
38. As a developer, I want list queries to join **Products** to **Main Product Item** deterministically, so that **`is_main_product`** rules are honored.
39. As a developer, I want **Category** subtree filtering implemented in SQL or repository logic with clear semantics, so that **Root Category** selection is efficient and correct.
40. As a developer, I want attribute-based filtering to use existing **Product Item** attribute tables where present, so that facets align with dynamic merchandising data.
41. As a developer, I want integration tests or e2e smoke for catalog happy paths, so that regressions in list + filter are caught early.
42. As a maintainer, I want the **`store`** library or other shared HTTP clients reused if they already wrap **`ecommerce-api`**, so that duplication stays low (`CONTEXT-MAP` lists **`store`** as e-commerce–related).
43. As a maintainer, I want **`auth`** / **`auth-web`** integrated only where needed for wishlist gating, so that security rules stay centralized.
44. As a shopper, I want the second storefront app (if deployed) to be able to reuse the same **`ecommerce-api`** contracts, so that **API** design is client-agnostic.
45. As a shopper, I want sort and filter state to survive in-session navigation (within the SPA) even if the URL does not encode it, so that v1’s “no URL serialization” decision does not imply losing state on every internal navigation if the implementation keeps state in memory or a store.
46. As a shopper, I want clear distinction between “no results” and “still loading”, so that I do not confuse the two.
47. As a **Registered User**, I want wishlist duplication or idempotent add behavior defined by the client/API contract, so that repeated clicks do not corrupt my **Wishlist**.
48. As a **Guest User**, I want **Cart** merges to follow existing session/user rules in the platform, so that guest **Cart** behavior stays consistent outside the catalog page.
49. As a product owner, I want **Rating** and “**Highest rated**” sort omitted until the rating domain is in scope, so that we do not fake social proof.
50. As a product owner, I want “**Most popular**” sort omitted until a popularity metric exists, so that we do not ship arbitrary rankings.
51. As a developer, I want performance considerations for large catalogs (indexes, limit/offset or cursor strategy) documented in implementation notes, so that pagination scales sensibly.
52. As a shopper, I want images to fail softly with a placeholder, so that missing asset URLs do not break the grid.
53. As a shopper, I want tap targets on mobile for filters and pagination to meet reasonable touch sizes, so that the catalog is usable on phones.
54. As a developer, I want i18n source locale (`el-GR` in **`ecommerce`**) respected for new strings, so that translations can be extracted consistently.
55. As a stakeholder, I want this work scoped to **`ecommerce`** + **`ecommerce-api`** primarily, so that **business-portal** admin flows remain separate unless shared libs force a small shared change.

---

## Implementation Decisions

**Nx and ownership**

- **In scope:** Storefront catalog in Angular app **`ecommerce`**; HTTP and persistence in **`ecommerce-api`**. Shared consumption via existing **`libs/`** as needed (**`shared`**, **`auth`** / **`auth-web`**, **`store`** if that is the established API surface per graph—confirm against Nx graph before deep coupling).
- **Likely out of direct scope:** **`business-portal`** and **`business-portal-api`** unless admin screens are explicitly needed to seed catalog data; catalog read paths remain **`ecommerce-api`** per **`CONTEXT-MAP.md`**.
- Respect **`@nx/enforce-module-boundaries`** and **`ecommerce`**’s **`eslint-plugin-boundaries`** strict graph: **`layout/`** composes routes; catalog behavior lives under a **`domains/...`** slice (catalog/product discovery bounded context) with **`api/*.routes.ts`** lazy routes, **`feat-*`** routed pages, **`application/`** for orchestration (signals/facade/store), **`domain/`** for pure rules, **`infrastructure/`** for HTTP; reuse **`pattern/`** only if a filter shell is genuinely cross-domain, per **`docs/front-end-infrastructure.md`**.

**Domain and API semantics (authoritative glossary: `docs/ecommerce/CONTEXT.md`)**

- List cards and list pricing: **Main Product Item** **Sale Price** and imagery associated with that **Product Item**; **Product** supplies marketing/name/category.
- **Search (v1):** match **`products.name`** only (case-folding and normalization are implementation choices; document collation if relevant).
- **Sort (v1):** **Newest** by **`products.created_at`** descending; **Price** by **Main Product Item** **Sale Price** ascending/descending. Do **not** ship “Highest rated” or “Most popular” in v1.
- **Price filter:** compare **Main Product Item** **Sale Price** only; other **Product Items** do not affect inclusion.
- **Category filter:** facet lists **Root Categories**; selecting one includes **Products** in that **Category** or any **Child Category** beneath (subtree inclusion), until a nested selection narrows further if implemented.
- **Attribute facets:** dynamic values from attribute-linked **Product Items** intersecting the current **Product** result set; no hardcoded XS–XXL / color lists in UI for v1 if data drives facets.
- **Wishlist:** **Registered User** persistence; guests see affordance but must complete sign-in/registration to persist; grid wishlist adds **Main Product Item** by default; PDP may change **Product Item** before add.
- **Cart (guest or registered):** grid add uses **Main Product Item** by default; PDP may override **Product Item**.
- **Copy:** customer-facing **options** / **more options**, not “variant.”
- **URL state (v1):** no requirement to serialize search, filters, sort, or page to query params; refresh may reset catalog state—accept for v1.
- **Rating:** no rating display or rating filter; no dependency on review tables for this slice.

**NestJS (`ecommerce-api`)**

- Extend or add use cases under the existing **`ProductsModule`** (or successor module split) following **`docs/nestjs-architecture.md`**: controllers thin, application services coordinate, domain rules pure, Drizzle in repositories/mappers.
- Queries must join **Products** ↔ **Product Items** for **`is_main_product = true`**, enforce **Active Product** / soft-delete filters consistent with schema (`deleted_at` patterns if used).
- **Category** subtree: implement against hierarchical **Category** tables already modeled (parent/child relationships); align table names in code (`product_categories`, etc.) with Drizzle schema without leaking raw SQL names into DTOs—use stable response field names (`categoryId`, `name`, `parentId`, …).
- **Facets:** repository or read model query aggregating distinct attribute values for **Product Items** constrained by the current **Product** filter—exact SQL/design to match existing **`product_item_attributes`** / attribute value tables under Drizzle schema in **`ecommerce-api`**.
- Response DTOs: list item should expose **Product** id/name, **Category** breadcrumb or leaf id as needed for UI, **Main Product Item** id, **Sale Price** (and **Original Price** if the card shows strike-through elsewhere), image URLs, optional “option” summary for display, pagination metadata (`total`, `page`, `pageSize`).

**Angular (`ecommerce`)**

- Catalog route segment under lazy **`domains/.../api/*.routes.ts`**; feature components under **`feat-catalog`** (or equivalent) with container + presentational split as the app already prefers.
- State: signal-based store or facade in **`application/`** holding search string, facet selections, sort, pagination, loading/error—no requirement to sync to **`ActivatedRoute`** query params for v1.
- **`Wishlist`** / **`Cart`:** integrate through existing **`application/`** ACL or facades (`anti-corruption-layer`) if present; do not bypass boundaries by importing another domain’s internals.
- **Responsive:** sidebar filters collapse to drawer/modal on narrow breakpoints; grid column CSS adapts.
- **`libs/auth-web`:** use for gating wishlist persistence / login modal when guest clicks wishlist.

**Schema / persistence**

- If attribute or category queries require indexes, add migrations in the **`ecommerce-api`** migration path.
- Do **not** add rating columns for this PRD.

**API contracts (shape, not file paths)**

- **GET** (or equivalent) catalog list endpoint accepting: optional search string (`name`), optional **Root Category** id (subtree semantics), optional nested **Category** id if supported, optional min/max price on **Main Product Item** **Sale Price**, optional facet parameters keyed by attribute id or stable code, sort enum (`newest` | `price_asc` | `price_desc`), pagination (`page`/`limit` or `cursor`).
- Response: array of list **Product** DTOs as above + `total` count + pagination fields; optional separate **facet** payload listing available values per attribute for the *current* constrained query (either combined response or follow-up call—pick one and document in implementation).

**Facet combination logic (v1 default)**

- If not otherwise specified: typical ecommerce semantics—**AND** between different facet types and search/**Category**/price band; within one attribute, if multi-select is supported, **OR** among selected values. If v1 is single-select per facet only, document that explicitly during implementation.

---

## Testing Decisions

- **Angular (`nx test ecommerce`):** favor tests on **application** facades/stores and **domain** pure functions (filter/sort invariants where client-side); component tests for critical templates (empty/loading/error) with shallow dependency boundaries per **`docs/front-end-infrastructure.md`** (avoid brittle DOM internals).
- **Nest (`nx test ecommerce-api`):** unit tests for application services building catalog queries (mock repositories); repository integration tests if the repo already uses a test DB pattern for Drizzle.
- **Contract:** optional snapshot or schema validation for list DTO shape if harness exists.
- **E2E:** if Playwright/Cypress exists in workspace, one smoke path: load catalog → apply one filter → expect count change; otherwise defer.

---

## Out of Scope

- **Rating** display, **Review** models, “**Highest rated**” sort, and any star UI tied to persisted data.
- **Most popular** sort until a defined popularity signal exists in the domain.
- **URL serialization** of catalog state (shareable / refresh-restorable deep links) for v1.
- **business-portal** merchandising UX unless explicitly required to enter catalog test data.
- **Full-text** search across descriptions, **Product Code**, or embeddings—v1 is **`products.name`** only.
- **Cross-listing** **Product** assignment to multiple **Categories**—domain currently assumes single **Category** per **Product** unless extended later.
- **SEO** canonical URLs and server-side rendering specifics—only mention if SSR route already exists; not a goal of this PRD by default.

---

## Further Notes

- **Canonical language:** `docs/ecommerce/CONTEXT.md` remains the glossary; align UI strings and API field naming with **Product**, **Product Item**, **Main Product Item**, **Category**, **Root Category**, **Cart**, **Wishlist**, **Guest User**, **Registered User**.
- **Prototype drift:** If Drizzle schema uses `product_categories` while the glossary says `categories`, treat it as the same domain **Category** concept—align documentation lazily if needed without blocking implementation.
- **`features/ecommerce-catalog.md`:** update when convenient so the written feature overview matches deferred **Rating**, sort list, and “options” wording.
- **Publishing as an issue:** use `gh issue create` per `docs/agents/issue-tracker.md` and apply the **`Sandcastle`** label (maps to **`ready-for-agent`** in `docs/agents/triage-labels.md`). Skipping the comment HTML comment at the top of this file when pasting into GitHub is optional.
