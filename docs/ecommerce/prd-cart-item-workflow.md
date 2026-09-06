# Spec: Cart Item workflow (in-chat conversion)

<!-- Source: grill-with-docs + to-spec-overlay. Glossary: docs/ecommerce/CONTEXT.md. ADRs 0004, 0005, 0006, 0007. Publish: gh issue create --title "Spec: Cart Item workflow (in-chat conversion of Product recommendations)" --body-file docs/ecommerce/prd-cart-item-workflow.md --label Sandcastle -->

## Problem Statement

Shoppers can describe a **product need** to the **Shopping Assistant** and receive **Product recommendations**, but they cannot convert a recommendation into a **Cart Item** without leaving chat. The assistant is forbidden from picking a **Product Item** or writing the **Cart**. Product detail already adds to the **Cart**, but chat recommendations are a dead end: the shopper loses the **product need** context and often receives the **Main Product Item** (catalog-grid default) instead of the size or colour they meant. There is no in-chat path that resolves **options**, shows **Sale Price** on the actual **Product Item**, respects **Inventory**, and commits through the same **Cart** path **Guest Users** and **Registered Users** already use.

## Solution

Deliver a **Cart Item workflow**: a Mastra workflow that **Shopping Assistant** (`shoppingAgent`) may **start as a tool** (or that a recommendation card action may start) for **one Product** from **this thread’s last Product recommendations**. The workflow matches option hints to a **Product Item** via **`ecommerce-api`**, never silently uses **Main Product Item** when others exist, never writes an **Out of Stock Product Item**, and always confirms (name, **options**, **Sale Price** on that **Product Item**, quantity 1…**Inventory**) before the storefront **Cart** path writes the **Cart Item**. Pickers and confirm are **A2UI v0.9** surfaces built from the **base catalog** only (Column, Row, Card, Text, Image, Button, TextField, CheckBox, Divider, List), using the generic envelope and **`submitAnswer`** form contract below — emitted as workflow step results, **not** authored by `shoppingAgent`. Success may navigate to existing **Checkout**; the workflow does not place an **Order**. Domain language remains `docs/ecommerce/CONTEXT.md`; boundaries in ADRs **0004**, **0005**, **0006**, **0007**.

---

## User Stories

1. As a **Guest User**, I want to start **Cart Item workflow** from an Add action on a **Product recommendation** card, so that I can convert that **Product** without typing.
2. As a **Guest User**, I want to start **Cart Item workflow** by saying “add the second one” (or naming a last-turn recommendation), so that natural language matches existing **Shopping Assistant** references.
3. As a **Guest User**, I want option hints in that utterance (“the second one in red, 42”) forwarded to the workflow, so that I am not asked to tap values I already stated.
4. As a **Guest User**, I want a start with no hints to open option pickers when the **Product** has more than one **Product Item**, so that I am not given a silent **Main Product Item**.
5. As a **Guest User**, I want pickers skipped when the **Product** has a single **Product Item**, so that I go straight to confirm.
6. As a **Guest User**, I want pickers skipped when my hints uniquely identify one **In Stock Product Item**, so that I go straight to confirm.
7. As a **Guest User**, I want ambiguous or incomplete hints to show pickers instead of guessing a **Product Item**, so that the model never chooses the sellable unit.
8. As a **Guest User**, I want **Out of Stock Product Item** combinations disabled in pickers, so that I cannot confirm unsellable units from chat.
9. As a **Guest User**, I want a unique match that is out of stock to skip the silent fast path and show pickers (that combination disabled), so that I can pick another in-stock **Product Item**.
10. As a **Guest User**, I want the workflow to stop with a clear message when every **Product Item** is out of stock, so that I am not shown a fake confirm.
11. As a **Guest User**, I want confirm to show **Product** name, chosen **options**, and **Sale Price** on **that Product Item**, so that I see the price that will hit the **Cart** (not the recommendation card’s **Main Product Item** price).
12. As a **Guest User**, I want quantity to default to 1 and not exceed **Inventory**, so that I cannot confirm five of two.
13. As a **Guest User**, I want the **Cart** write to happen only after I confirm on the A2UI surface, so that resolving a **Product Item** is not already a mutation.
14. As a **Guest User**, I want confirm to add the **Cart Item** via the same guest **Cart** path as product detail (local persistence), so that I do not need an account to convert in chat.
15. As a **Registered User**, I want that same confirm to add via the registered **Cart** path (server), so that the line appears on other devices per existing **Cart** rules.
16. As a **Guest User**, I want adding the same **Product Item** again to merge quantities like the rest of the storefront, so that I do not get duplicate lines.
17. As a **Guest User**, I want at most one **Cart Item workflow** run at a time, so that I never see two confirms.
18. As a **Guest User**, I want a new **product need** while pickers/confirm are up to abandon the run (no **Cart** write) and let **Shopping Assistant** search again, so that retrieval still works.
19. As a **Guest User**, I want “add the first one instead” to abandon the current run and start **Cart Item workflow** for that last-turn **Product**, so that I can change my mind.
20. As a **Guest User**, I want an explicit cancel to abandon with no **Cart** write, so that I can back out.
21. As a **Guest User**, I want unrelated chatter (greetings, “wait”) to leave pickers/confirm up with a short reminder, so that an accidental message does not throw away a resolved **Product Item**.
22. As a **Guest User**, I want “add the second and the third” to resolve **one** **Product** (first mentioned, or a which-one question), so that one run still produces one **Cart Item**.
23. As a **Guest User**, I want a success surface after confirm, so that I know the **Cart Item** exists.
24. As a **Guest User**, I want that success surface to offer navigation to existing `/checkout`, so that I can continue to **Checkout** without in-chat address or **Payment**.
25. As a **Guest User**, I want **Cart Item workflow** never to collect **Shipping Address**, **Payment**, or **Guest Checkout Identity**, so that **Checkout** stays the existing page.
26. As a **Guest User**, I want **Shopping Assistant** to keep recommending **Products** for a **product need**, so that discovery does not pick sizes or write the **Cart**.
27. As a **Guest User**, I want a first message “add the blue Nike” with no prior recommendation to be refused (no **Cart Item workflow**), so that the assistant is not a catalog name resolver.
28. As a **Guest User**, I want starting from the product detail page (“add this”) **not** to be offered in this spec, so that PDP add stays the page’s job.
29. As a **Guest User**, I want A2UI pickers/confirm built only from base catalog components, so that we do not depend on a custom widget catalog for v1.
30. As a **Guest User**, I want form submit on those surfaces to use **`submitAnswer`** with data-model **paths**, so that typed quantity and option fields actually reach the client.
31. As a **Guest User**, I want replies in my language, with **Product** names, **options**, and **Category** path untranslated, so that chat stays consistent with **Shopping Assistant**.
32. As a **Registered User**, I want the same conversion rules as a guest, so that sign-in is not required to use **Cart Item workflow**.
33. As a shopper, I want **Shopping Assistant** never to submit a **Product Item** id, so that the workflow (via **`ecommerce-api`**) is the only matcher.
34. As a shopper, I want card Add to start the workflow with empty hints, so that tap is unambiguous.
35. As a shopper, I want confirm to cap quantity at live **Inventory** even if stock changed since pickers, so that the write stays honest.
36. As a shopper, I want a failed **Cart** write (network, missing **Product Item**) to show an error on the surface without inventing a **Cart Item**, so that I can retry or cancel.
37. As a shopper, I want **Checkout** from the success control to keep the empty-**Cart** guard behaviour of the existing page, so that I only enter **Checkout** with a non-empty **Cart**.
38. As a developer, I want **`ecommerce-api`** to own **Product Item** listing, option matching, **Sale Price**, and **Inventory** for a **Product**, so that Mastra stays a client (same pattern as assistant retrieval).
39. As a developer, I want **Inventory** persisted on **Product Item**, so that out-of-stock rules are not theatre.
40. As a developer, I want a Cart-owned add event for an arbitrary **Product Item** + quantity (not catalog `addFromBrowse`), so that **shopping** dispatches through the Cart ACL only.
41. As a developer, I want `shoppingAgent` instructions to describe **when** to start conversion (last-turn **Product** + hints), not how to draw A2UI, so that ADR 0007 holds.
42. As a developer, I want A2UI messages to follow the generic v0.9 envelope (no `version` wrapper, split createSurface / updateComponents / updateDataModel), so that the existing `a2ui-surface` renderer accepts them.
43. As a developer, I want only **`submitAnswer`** as the interactive A2UI event name in v1, so that the client does not grow a Flight42-style `checkIn` map.
44. As a developer, I want **`nx test ecommerce-api`** to cover matching and stock, and **`nx test ecommerce`** to cover the Cart event, so that the deep module is tested at the highest existing harness.
45. As a maintainer, I want **`business-portal`** out of this spec, so that admin stock editing can follow later.
46. As a shopper using assistive technology, I want TextField labels and Button labels on confirm/pickers, so that conversion is operable without a pointer.
47. As a shopper, I want the recommendation card’s **Main Product Item** **Sale Price** to remain the discovery price, so that **Product recommendation** contracts do not change.
48. As a shopper, I want **Shopping Assistant** still to refuse account and **Order** questions, so that this workflow is conversion only.
49. As a shopper, I want a second conversion after success for another last-turn recommendation, so that I can add another **Cart Item** without a new search.
50. As a shopper, I want off-catalog chat during an idle assistant (no in-flight workflow) unchanged from today, so that retrieval rules stay intact.

---

## Implementation Decisions

**Nx**

- **In scope:** `ecommerce` (storefront chat, A2UI render, **Cart** write), `ecommerce-api` (Product Item conversion HTTP), `shared` (existing A2UI renderer / `provideA2uiCatalog` with **BasicCatalog** only — no custom catalog components for v1).
- **Mastra:** `shoppingAgent` plus a registered **Cart Item workflow** started as a tool; card tap may start the same run. Not an Nx project id; do not add a second shopper-facing agent.
- **Out of direct scope:** `business-portal`, `business-portal-api`.
- Respect `@nx/enforce-module-boundaries` and `ecommerce` `eslint-plugin-boundaries`. **Shopping** must not import **CartStore**; writes go through Cart ACL events.

**Seams (confirmed)**

1. **`ecommerce-api` Product Item conversion** — deep module: **Product** id + optional option hints → unique **In Stock Product Item** or picker payload (each item: id, **options**, **Sale Price**, **Original Price**, **Inventory**, image if available). Matching and stock live here. Mastra is an HTTP client, like `search_products_by_need`.
2. **Existing CartStore** — new Cart-owned NgRx Signal Store event: add this **Product Item** + quantity + merchandising snapshot. Re-export from Cart `anti-corruption-layer`. **Shopping** (or chat confirm handler) **dispatches only**. Do **not** reuse catalog `addFromBrowse` (**Main Product Item** from browse).
3. **Thin Mastra workflow** — calls seam 1; emits A2UI from step results (`{ surfaceId, messages }` → existing `a2ui-surface` activity). No second matcher. No `POST /cart`.
4. **Chat surfaces** — **shopping** domain + `shared` BasicCatalog. Confirm **`submitAnswer`** → dispatch Cart event. Success control may navigate to existing **Checkout**.

**Angular (`ecommerce`)**

- Keep **Shopping Assistant** CopilotKit **Product recommendation** cards as they are; do not migrate them to A2UI in this spec.
- **Cart Item workflow** surfaces: base catalog only. Confirm handler is storefront code: on **`submitAnswer`**, dispatch the Cart add event; do not call **CartStore** methods from **shopping**.
- Cross-domain write: Cart owns `event(...)` payloads and reducers; ACL re-exports; shopping dispatches.
- Guest vs registered persistence remains ADR **0004** inside **CartStore**.

**NestJS (`ecommerce-api`)**

- New application use case (Presentation → Application → Domain → Infrastructure). Domain matching is pure: hints vs **options** on **Product Items**; uniqueness; **In Stock** means **Inventory** > 0; quantity cap is min(requested, **Inventory**).
- HTTP: read by **Product** id; optional hint fields (structured or raw strings — pick one contract and keep it stable). Response either `matchedProductItem` or `items[]` for pickers, plus enough data to bind A2UI (never a model-invented id).
- Do not extend catalog `GET /products/catalog?q=` (ADR **0005**).
- Add-to-cart HTTP unchanged; workflow still does not call it.

**Schema / persistence**

- Add **Inventory** on **Product Item** (non-negative integer, default 0 or a seed that makes current fixtures honest). Out of stock = 0. This spec includes the column; **business-portal** stock admin is out of scope (seed/migration may set values).
- No **Order** / **Payment** / address schema changes.

**Shopping Assistant**

- May start the workflow with `{ productId, optionHints? }` from a last-turn recommendation or card. Never a **Product Item** id.
- Instructions: when to start conversion only. **Do not** attach Flight42-style “NEVER plain text / ALWAYS renderA2uiTool” rules. **Product recommendations** remain cards + short why.
- Data rule unchanged: instructions describe jobs, not tool names.

**A2UI — generic contract (extracted; base catalog only)**

Surfaces are **workflow-built**, not LLM-designed. Copy this envelope; do not wrap in `version`. `catalogId` is the storefront **BasicCatalog** id already registered when `provideA2uiCatalog()` is called with no custom catalog.

Envelope: `messages` is an array of **separate** single-key objects: only `createSurface` **or** only `updateComponents` **or** only `updateDataModel`. Same `surfaceId` everywhere. Root component id `root`, `component`: `Column`. Every component has both `id` and `component` (not `type`). Every child id referenced must exist in the same `updateComponents.components` array.

Base catalog components allowed: **Column, Row, Card, Text, Image, Button, TextField, CheckBox, Divider, List**. No custom catalog components (no TicketWidget-style entries).

Nesting: Row, Column, List use `children` (array of ids). **Card** and **Button** use a single `child` (one id), not `children`. Several elements in a Card: wrap in a Column and pass that id as `child`.

Interactive v1: **only** Button `action.event.name` = **`submitAnswer`**. Do not invent `checkIn` or add-to-cart event names. TextField / CheckBox `value` binds `{ "path": "/..." }`. Seed those paths with `updateDataModel` **before** typing. `submitAnswer` `context` references the **same paths** (not literal strings). Client receives `{ type: "a2ui_form_response", surfaceId, context }` and continues (dispatch Cart add, resume pickers, cancel, or navigate to **Checkout**). Unseeded paths arrive empty.

Confirm surface: one Card; **Product** name, **options**, **Sale Price** on the **Product Item**, quantity TextField bound to a path, submit Button (`submitAnswer`) and a cancel control that also uses `submitAnswer` with an explicit cancel flag in context (path-seeded).

Option pickers: same form pattern (CheckBox / Button + `submitAnswer`), not custom option widgets.

Illustrative envelope (shape only — workflow fills ids and copy):

```json
{
  "messages": [
    { "createSurface": { "surfaceId": "srf-confirm", "catalogId": "<BasicCatalog id>" } },
    {
      "updateComponents": {
        "surfaceId": "srf-confirm",
        "components": [
          { "id": "root", "component": "Column", "children": ["card"] },
          { "id": "card", "component": "Card", "child": "form" },
          { "id": "form", "component": "Column", "children": ["title", "price", "qty", "submit"] },
          { "id": "title", "component": "Text", "text": "<Product name>", "variant": "h3" },
          { "id": "price", "component": "Text", "text": "<Sale Price>", "variant": "body" },
          { "id": "qty", "component": "TextField", "label": "Quantity", "value": { "path": "/confirm/quantity" } },
          {
            "id": "submit",
            "component": "Button",
            "child": "submit-label",
            "action": {
              "event": {
                "name": "submitAnswer",
                "context": { "quantity": { "path": "/confirm/quantity" } }
              }
            }
          },
          { "id": "submit-label", "component": "Text", "text": "Add to cart" }
        ]
      }
    },
    {
      "updateDataModel": {
        "surfaceId": "srf-confirm",
        "path": "/confirm",
        "value": { "quantity": "1" }
      }
    }
  ]
}
```

**HTTP contract (shape)**

- Input: `productId` (required); optional option hints (e.g. list of `{ attributeName, value }` or a single raw hint string parsed server-side — implementers pick one and test it).
- Output (one of): `{ status: "matched", productItem: { id, options, salePrice, originalPrice, inventory, name, imageUrl } }` | `{ status: "needs_options", items: [ ...same fields ] }` | `{ status: "all_out_of_stock" }` | `{ status: "not_found" }`.
- Matching: unique **In Stock** → `matched`; unique but **Inventory** 0 → `needs_options` with that item disabled/flagged; none unique → `needs_options`; all **Inventory** 0 → `all_out_of_stock`.

**ADRs to respect**

- **0004** — guest localStorage / registered server; no workflow `POST /cart`; no guest server carts.
- **0005** — assistant retrieval ≠ catalog `q`.
- **0006** — chat refuses OOS; confirm via **CartStore**; quantity cap at **Inventory**.
- **0007** — Mastra workflow as a tool of `shoppingAgent`; A2UI from step results; not a sub-agent; not generic A2UI-authoring instructions on the main agent.

---

## Testing Decisions

- **Good tests** assert behaviour at public surfaces: HTTP status unions, matching table (hints × items × stock), Cart event → line with the **Product Item** id and quantity, `submitAnswer` context → dispatch. Do not assert Mastra internals, A2UI processor private state, or component template internals.
- **`ecommerce-api`:** use-case tests with mocked repositories — unique in-stock match, ambiguous hints, OOS unique match, all OOS, missing **Product**. Matching is the priority harness (`nx test ecommerce-api`).
- **`ecommerce`:** extend Cart store specs for the new add-**Product Item** event (guest merge + auth POST), same style as `addFromBrowse`. Optional thin test that the confirm handler dispatches the ACL event (`nx test ecommerce`).
- **`shared`:** only if the A2UI activity renderer changes; prefer not to.
- **ai-server:** no required automated suite in this spec; workflow is a client of the Nest contract.
- **E2E:** optional later; not required to close this spec.
- **Prior art:** `add-cart-item.use-case.spec.ts`, `cart.store.spec.ts`, `search-product-embeddings.use-case.spec.ts` (Nest as source of truth, Mastra as client).

---

## Out of Scope

- In-chat **Checkout**, **Payment**, **Guest Checkout Identity**, **Order** creation.
- **Shopping Assistant** adding to the **Cart** or picking a **Product Item**.
- Sub-agent under `shoppingAgent`; generic “NEVER plain text / ALWAYS renderA2uiTool” instructions on the main agent.
- Custom A2UI catalog components (TicketWidget-style); migrating **Product recommendation** cards from CopilotKit widgets to A2UI.
- Product-detail “add this”; resolving a named **Product** with no last-turn recommendation.
- Queue/bundle of multiple **Products** in one run.
- Enforcing **Inventory** on product-detail add or `AddCartItemUseCase` (chat remains stricter).
- **business-portal** inventory admin UI.
- `checkIn` or other Flight42 event names.
- Account / **Order** / **Review** questions in chat.
- Reopening ADR **0004** guest server carts.

---

## Further Notes

- Canonical language: **Cart Item workflow**, **Product recommendation**, **Product Item**, **Main Product Item**, **options**, **Inventory**, **Cart**, **Guest User**, **Registered User**. Avoid Cart Builder, variant, add-to-cart agent, in-chat **Checkout**.
- Flight42 prompt: only the **generic A2UI envelope, base catalog, Card/Button `child` vs `children`, and `submitAnswer` path-binding** were taken. Flight, hotel, ticket, co-planning, `messageWidget` / `flightWidget`, and “never plain text” were discarded as product-specific and contradictory to **Shopping Assistant**.
- If a later change lets an LLM call a `renderA2ui` helper, it belongs **inside the workflow**, not on `shoppingAgent`, unless ADR **0007** is explicitly reopened.
- Seed **Inventory** so demo catalog conversions can show both in-stock and out-of-stock **Product Items**.
