---
status: accepted
---

# Angular component structure best practices

This ADR records the conventions for deciding **when a component template is too large**, **when to extract a sub-component**, and **where that sub-component lives** in the workspace's DDD-oriented folder layout (see [docs/front-end-infrastructure.md](../front-end-infrastructure.md)).

## Context

Angular components are the primary composition unit on the front end. As features grow, a single component file can accumulate template markup, local signals, event handlers, and styles for several distinct concerns. Without a shared standard, teams diverge: some inline everything; others over-abstract into components that are never reused. Both extremes raise review friction, slow rendering optimisation, and blur ownership inside the DDD layer model.

The ecommerce storefront's `catalog-browse.page.html` (252 lines at the time this ADR was written) is a representative example. It contains a category root chip bar, a search-and-sort toolbar, a price range slider band, attribute facet checkboxes, a product card grid, and a paginator — all inside one template. Each of those blocks is already a candidate for the extraction rules below.

---

## Decision

We adopt the thresholds and placement rules described in the **Best practices** section below. The rules are ordered by priority: check them in order and stop at the first match.

---

## Best practices

### 1. The 130-line template rule

A single component template that exceeds **≈ 130 lines of markup** is a smell. Scan for the naturally distinct visual or behavioural regions inside it:

- Does the template contain multiple `@if` / `@for` blocks that each describe a self-contained piece of UI (a filter panel, a card, a toolbar)?
- Could any region be summarised in one noun phrase (e.g. *category chip bar*, *product card*, *facet group*)?

If yes on either count, that region is a candidate for extraction regardless of line count.

> **Why 130 lines?** It is roughly the amount that fits in a standard editor pane with comfortable vertical space. Beyond it, reviewers must scroll significantly to understand the full structure, and change-detection scope becomes harder to reason about.

---

### 2. Extract when a region repeats inside a `@for`

A block that appears inside `@for` almost always belongs in its own component. The `@for` item is the natural `@Input` surface, and Angular's change detection can be scoped to the individual item instance.

**Inline (smell):**

```html
@for (item of catalog.items; track item.productId) {
  <li class="catalog-card">
    <div class="catalog-card__media"> … </div>
    <div class="catalog-card__body"> … </div>
  </li>
}
```

**Extracted (preferred):**

```html
@for (item of catalog.items; track item.productId) {
  <app-catalog-product-card [item]="item" />
}
```

The card component owns its own template, styles, and the single responsibility of displaying one product summary. This also enables `OnPush` change detection on the card, reducing re-render cost when only unrelated parts of the parent signal graph change.

---

### 3. Extract when a region has its own user interaction contract

If a block of markup handles its own events and would naturally emit one or more user actions back to the page, extract it with `@Input` parameters and `@Output` emitters (or an injected store method — see rule 6).

Examples from the catalog browse page:

| Region | Inputs | Outputs |
|---|---|---|
| Category chip bar | `roots`, `selectedId` | `categorySelected` |
| Search & sort toolbar | `sort`, `sortOptions`, `searchDraft` | `searchApplied`, `sortChanged` |
| Price range band | `min`, `max`, `options`, `error` | `priceApplied`, `priceCleared` |
| Attribute facets | `facets`, `selectedValues` | `facetValueChanged`, `filtersCleared` |
| Product card | `item` | *(output optional — e.g. `addToCart`)* |

Keeping all five of these regions inside a single page component means a single change to the price slider logic forces re-testing the entire page template.

---

### 4. Extract when the same markup would be copied to a second location

Copy-paste is the definitive signal that a component boundary is missing. Before duplicating any block of more than ~10 lines, pause and extract.

---

### 5. Do **not** extract for the sake of brevity alone

A region that:

- is unlikely to appear anywhere else,
- has no distinct user-interaction contract,
- reads naturally in context, and
- sits comfortably within the 80-line budget after sibling extractions

...should stay **inline**. Micro-components with a single `<p>` or trivial wrapper `<div>` are an unnecessary indirection.

---

### 6. Choose `@Input`/`@Output` vs. store injection deliberately

When extracting a sub-component, decide upfront how it receives data:

| Pattern | When to use |
|---|---|
| `@Input()` / `@Output()` | The component is **presentational** — it has no knowledge of stores or services. This is the default for items inside `@for` loops and most leaf components. |
| Direct store injection | The component is a **smart widget** — it reads from and dispatches to a store it owns (e.g. a filter panel that calls `store.clearAttributeFilters()` directly). Acceptable when the component lives in the same feature or domain. |
| Injected **`core-api`** or ACL adapter | The component spans domains or is placed in `ui/`, `pattern/`, or `libs/`. Never inject a domain store from outside that domain — use the anti-corruption layer instead (see [front-end-infrastructure.md](../front-end-infrastructure.md)). |

---

### 7. Place extracted components in the right folder

The DDD layer model already tells you where each extracted component lives:

| Scope of reuse | Folder | ESLint element type |
|---|---|---|
| Used only within one feature page | Same `feat-<name>/` folder as the page | `domain-feature` |
| Used across features **within the same domain** | `domains/<domain>/feat-shared/` | `domain-shared` |
| Used across **multiple domains** within one app, presentational | `ui/<name>/` + `public-api.ts` | `ui-api` |
| Used across **multiple domains**, behaviour-rich | `pattern/<name>/` + `public-api.ts` | `pattern-api` |
| Used across **multiple apps** | `libs/<name>/src/` + `public-api.ts` | `lib-api` |

Never import a component from a `feat-<name>/` folder of a **different** domain — that is an ESLint boundary violation. Promote to `feat-shared/`, `ui/`, or `pattern/` first.

---

### 8. Naming conventions for extracted components

Follow the naming conventions from the ESLint config:

- **Selector prefix:** `app-` for all application components; `lib-` (or agreed prefix) for library-scoped components.
- **Selector style:** element selector, kebab-case (e.g. `app-catalog-product-card`).
- **File name:** mirrors the selector without the prefix (e.g. `catalog-product-card.component.ts`).
- **Class name:** PascalCase, ends in `Component` (e.g. `CatalogProductCardComponent`).

For sub-components that live inside a feature and are unlikely ever to be promoted, a shorter name scoped to the feature is acceptable: `catalog-browse-facet-group.component.ts` inside `feat-browse/`.

---

### 9. One `ChangeDetectionStrategy.OnPush` per extracted component

Every extracted component **must** use `OnPush`. This is not optional for performance: presentational components inside `@for` loops should only re-render when their `@Input` reference changes (or when an injected signal notifies them). Without `OnPush`, extraction provides structural clarity but no runtime benefit.

---

### 10. Keep styles co-located with the component

Each extracted component owns its own stylesheet (`.component.scss` / `.component.css`). Do not share a parent component's stylesheet to style a child component's internals — that breaks encapsulation and makes promotion to `feat-shared/` or `ui/` harder.

---

## Consequences

- Feature pages stay navigable: the page component's template describes **layout and composition**; extracted components own their **own rendering**.
- `OnPush` + signal-aware components reduce unnecessary DOM diffing when only one facet of the page changes.
- ESLint boundary rules remain enforceable: components placed in the correct folder are automatically subject to the right import constraints.
- Reviewers can check a new feature's template with a single mental model: "is this a page assembling components, or a component rendering a region?"
- Deviations (keeping a large template inline for prototyping) should be tracked as tech-debt comments and resolved before the feature is promoted from a draft branch.

---

## References

- [Angular — Component interaction](https://angular.dev/guide/components/inputs)
- [Angular — Change detection with OnPush](https://angular.dev/best-practices/skipping-subtrees)
- [Workspace front-end infrastructure and DDD layer model](../front-end-infrastructure.md)
- [NgRx Signal Store conventions — ADR 0001](./0001-ngrx-signal-store-best-practices.md)
