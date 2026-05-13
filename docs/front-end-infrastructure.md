# Front-end infrastructure

This document describes how front-end applications are structured in this Nx monorepo, with emphasis on **domain-driven design (DDD)** layering and **enforceable module boundaries**. The canonical reference for those rules is the ecommerce Angular app’s ESLint configuration (`apps/ecommerce/eslint.config.mjs`), which extends the workspace base config and adds [`eslint-plugin-boundaries`](https://github.com/javierbrea/eslint-plugin-boundaries) in **strict** mode.

---

## Monorepo context

- **Nx** orchestrates apps and libraries, shared tooling, and tasks (`nx serve`, `nx test`, etc.).
- **Cross-app reuse** belongs in **`libs/`** libraries, not by copying folders between apps. Libraries expose a single entry surface via `libs/<name>/src/public-api.ts` (see [Shared libraries](#shared-libraries)).
- **Workspace-wide** dependency rules for TypeScript/JavaScript live in the root `eslint.config.mjs` via `@nx/enforce-module-boundaries` (buildable libs, tag constraints). App-specific architectural rules for ecommerce are additional and more granular.

---

## ESLint configuration layers

### Root: `eslint.config.mjs`

The root config applies Nx “flat” presets and **`@nx/enforce-module-boundaries`** to all matching files. It ensures libraries declare compatible tags and that dependency directions align with Nx project graph expectations (`enforceBuildableLibDependency`, `depConstraints`). Any new shared library should declare **`tags`** in its `project.json` so these constraints remain meaningful.

### Ecommerce app: `apps/ecommerce/eslint.config.mjs`

This file:

1. **Extends** the root config plus Nx Angular flat configs (`flat/angular`, `flat/angular-template`).
2. Enables **`eslint-plugin-boundaries`** with **`boundaries.configs.strict`** merged into rules.
3. Registers **`boundaries/element-types`**: a rule graph that defines **which folder/file “element types” may import which others**.
4. Maps filesystem paths to **named element types** under `settings.boundaries.elements` (with **`capture`** groups such as `domain`, `feature`, `lib` for parameterized rules).
5. Sets **`boundaries/dependency-nodes`** to `import` and `dynamic-import` so lazy-loaded routes are checked too.

**Angular hygiene** (same app config):

- Directives: attribute selector, prefix `app`, `camelCase`.
- Components: element selector, prefix `app`, `kebab-case`.

Other Angular apps in the repo (for example `business-portal`) may use **only** the root + Nx Angular rules unless they adopt the same `boundaries` setup.

---

## Architectural model (DDD-oriented)

The ecommerce app treats **`apps/ecommerce/src/app`** as a bounded composition root:

| Area                       | Role                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`main`**, **`app`**      | Bootstrap and shell (`main.ts`, `app.ts`, `app.config.ts`, routes, specs).                                                                                                                                                                                                                                                                                                                   |
| **`core`**                 | App-wide singleton-style services, utilities, interceptors; exposes **`core/**/public-api.ts`** as **`core-api`**. When **another domain needs the owning bounded context’s entire state** (not just a curated ACL slice), that capability lives under **`core/<domain>/`** using the **same layered folders as under `domains/<domain>/`\*\*—see [Core folder layout](#core-folder-layout). |
| **`ui`**                   | Shared presentational building blocks for this app; **`ui/**/public-api.ts`** → **`ui-api`\*\*.                                                                                                                                                                                                                                                                                              |
| **`pattern`**              | Cross-cutting **UI together with behaviour** that **does not belong to a single domain**; reusable slices multiple bounded contexts can compose without owning them under **`domains/<name>/`**. **`pattern/**/public-api.ts`** → **`pattern-api`\*\*. See [Pattern folder](#pattern-folder).                                                                                                |
| **`layout`**               | Shell layout, navigation chrome, top-level route wiring that stitches domains together.                                                                                                                                                                                                                                                                                                      |
| **`themes`**, **`env`**    | Theming and environment configuration.                                                                                                                                                                                                                                                                                                                                                       |
| **`domains/<domain>/...`** | Per-domain vertical slices: routes, features, application, domain model, infrastructure, optional shared UI within the domain.                                                                                                                                                                                                                                                               |
| **`libs/...`**             | Shared code across apps; consumed through **`lib-api`** (`libs/*/src/public-api.ts`).                                                                                                                                                                                                                                                                                                        |

Boundary enforcement distinguishes **route definitions** (`domains/*/api/*.routes.ts`) from **implementation** folders so routing stays thin and dependencies stay predictable.

---

## Layout folder

**Purpose:** **`layout/`** holds the **application shell**—persistent chrome and routing glue that spans domains but **is not** a business bounded context itself. Typical contents: header, navigation, **`RouterOutlet`** hosts for lazy domain trees, and route modules that **compose** those domains (for example under **`layout/navigation/`**).

**Why not inside `domains/<name>/`?** Each **`domains/<name>/`** slice should stay focused on **that context’s** features, application logic, and infrastructure. Shell UI (global nav, cart badge in the header) is **orthogonal** to any single domain. Giving it a dedicated folder avoids folding “the whole app frame” into one arbitrary domain and keeps ownership clear.

**Why not only `app/`?** **`app/`** stays thin: bootstrap, root providers, and top-level **`Route[]`**. Concrete shell components and **nested route trees** under the main frame live under **`layout/`** so composition stays navigable and ESLint can treat **`layout`** as its own **boundary element** with tailored allowed imports.

**Dependency direction:** **`layout`** may wire **`domain-routes`** and consume **`domain-application-anti-corruption-layer-api`** (for example a cart icon that reads curated projections without injecting another domain’s store—see **Anti-corruption layer**). Bounded domains generally **must not** depend on **`layout`**; dependencies flow **shell → domains**, not the reverse. Details align with **`boundaries/element-types`** in **`apps/ecommerce/eslint.config.mjs`**.

See also [Routing composition](#routing-composition).

---

## Pattern folder

**Purpose:** **`pattern/`** is where you put a **cohesive unit of UI and business logic** that **does not fit cleanly inside one bounded context**. If several domains (or layout shell flows) need the same interaction—for example a multi-step widget, a filter panel that orchestrates queries beyond one aggregate, or a compound control—implement it here rather than duplicating under **`domains/<domain>/feat-*`** or parking arbitrary behaviour inside **`layout/`**.

**When to choose `pattern/`:** Ask whether **one domain alone** should own both the visuals **and** the rules.

| Answer                                                                 | Place code                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------- |
| Yes—the behaviour is genuinely “catalog”, “checkout”, etc.             | **`domains/<domain>/`** (`feat-*`, `application`, …).   |
| No—it mixes concerns from multiple contexts or is deliberately neutral | **`pattern/`** (consumers depend on **`pattern-api`**). |

**How `pattern/` differs from nearby folders:**

- **`ui/`** — Mostly **presentational** primitives (cards, buttons, dumb widgets). Little or no domain orchestration.
- **`layout/`** — **Shell**: chrome, navigation hosts, wiring **`domain-routes`**. Not the home for arbitrary reusable business-heavy widgets unless they are truly shell-specific.
- **`pattern/`** — **Behaviour-rich reuse**: combines **`ui-api`** / **`core-api`** primitives into something meaningful across contexts.
- **`libs/`** — Same conceptual reuse **across Nx apps**; **`pattern/`** is typically **within one Angular app** (still exported via **`pattern/**/public-api.ts`\*\* for imports).

**Boundaries:** In **`apps/ecommerce/eslint.config.mjs`**, **`pattern`** may use **`lib-api`**, **`env`**, **`core-api`**, and **`ui-api`**. **`domain-feature`**, **`domain-shared`**, **`domain-routes`**, and **`layout`** may depend on **`pattern-api`**—so domains compose patterns instead of patterns importing domain internals.

**Illustrative examples** (there is no **`pattern/`** tree under ecommerce yet; these are the kinds of slices that belong here):

| Example                                                                                                        | Why `pattern/` and not `domains/<one>/`?                                          |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Saved searches** — saved query chips + “save current filters” that catalogue _and_ orders might both surface | Behaviour + UI are **product-wide**, not owned by one bounded context.            |
| **Compare tray** — floating bar, max N items, clear/remove rules shared by listing + detail                    | Same orchestration reused across **multiple** domains’ pages.                     |
| **Global keyboard shortcut layer** — registers shortcuts and coordinates focus across routed outlets           | Neutral infrastructure-feeling UX that **must not** live inside **catalog** only. |

Implementation sketch: **`apps/ecommerce/src/app/pattern/compare-tray/`** with **`public-api.ts`** exporting **`CompareTrayComponent`** or a small façade; any consumer **`domains/<domain>/feat-<feature>/`** imports **`pattern/compare-tray/public-api.ts`** only (**`pattern-api`**), never deep internals under **`pattern/compare-tray/`**.

---

## Domain folder layout (`domains/<domain>/`)

Typical structure (names mirror ESLint patterns):

```text
domains/<domain>/
  api/
    <something>.routes.ts      # domain-routes: lazy routes, resolvers, route-level providers
  feat-<feature-name>/         # domain-feature: smart pages / routed containers
  feat-shared/                 # domain-shared: widgets reused across features in THIS domain only
  application/
    public-api.ts              # domain-application-api
    anti-corruption-layer.ts   # domain-application-anti-corruption-layer-api (explicit ACL surface)
    events.ts                  # NgRx Signals events (often re-exported via ACL for other domains)
    *.facade.ts, …             # domain-application orchestration
    *.store.ts                 # NgRx Signal Store (see below)—not raw HttpClient wrappers
  domain/
    public-api.ts              # domain-business-api
    *.model.ts                 # domain-business (pure domain types/rules)
  infrastructure/
    public-api.ts              # domain-infrastructure-api
    *.service.ts               # HTTP / remote clients
    *.model.ts                 # wire/API-only types (do not import from domain/)
  data/                        # optional mapping/cache helpers (still governed by feature/application imports)
  presentation/                # optional; path type exists in ESLint for future “presentation” slice
```

**HTTP and stores (mandatory split):**

- **`infrastructure/`** is the **only** place for **`HttpClient`**, REST/GraphQL clients, and other remote I/O services. Import those via **`domains/<domain>/infrastructure/public-api.ts`** (`domain-infrastructure-api`). Do not place API client classes under **`application/`**.
- **`infrastructure/`** defines **wire / transport types** (for example `*.model.ts` describing JSON payloads and query param enums). It **must not** import **`domains/<domain>/domain/`** or **`domain-business-api`**; that keeps HTTP contracts independent from the domain model and avoids circular coupling.
- **`application/`** maps wire types to **`domain/`** types (pure functions or small mappers next to stores) before state holds domain-shaped data. **`application/`** owns **NgRx Signal Store** (`signalStore` from **`@ngrx/signals`**) for feature or domain state, facades, and event wiring. Stores may depend on **`domain-infrastructure-api`** (same domain) and **`domain-business-api`**; they **must not** embed HTTP calls except by injecting infrastructure services typed against **`public-api.ts`** barrels.

**Naming:** Features live under **`feat-*`** so the plugin can capture **`feature`** for rules that restrict cross-feature coupling inside the same domain.

---

## Core folder layout

Use **`core/<domain>/`** (same segment name as the bounded context, e.g. **`cart`** → **`core/cart`**). Inner folders **mirror** **`domains/<domain>/`** layering:

```text
core/<domain>/
  application/
    public-api.ts              # stores, facades, event wiring surfaced via core-api
    events.ts                  # NgRx Signals events for core-owned stores (when applicable)
    *.store.ts, *.facade.ts, …
  domain/
    public-api.ts
    *.model.ts                   # types/rules at app-wide scope
  infrastructure/
    public-api.ts
    *.service.ts
    *.api.model.ts             # wire types for HTTP/persistence (mirror domains: infra does not import core/domain/)
```

**`<domain>`** here is the same conceptual name you would use under **`domains/`** (for example **`cart`** → **`core/cart`**). Typically **`api/`** and **`feat-*`** remain under **`domains/`** because they belong to navigation and UX slices; **`core/<domain>/`** holds **shared state, domain logic, and integration** that genuinely spans the app.

Surface **`core-api`** through **`core/**/public-api.ts`** (often **`core/<domain>/application/public-api.ts`** or a dedicated barrel) so consumers stay consistent with the existing ESLint **`core-api`\*\* pattern.

**ESLint note:** `domain-application-anti-corruption-layer-api` is wired only to **`domains/*/application/anti-corruption-layer.ts`**. Code under **`core/<domain>/`** is classified as plain **`core`**; prefer **`public-api.ts`** barrels under **`core/`** for stable imports until boundary rules are extended for core-local ACL files.

---

## Anti-corruption layer (`anti-corruption-layer.ts`)

In this codebase the **anti-corruption layer (ACL)** is not “the whole application layer”; it is the **single approved foreign-facing surface** for a bounded domain. Other domains, layout, or shell code **must not** reach into that domain’s stores, facades, or internal `application/` modules directly. They interact only with what **`domains/<domain>/application/anti-corruption-layer.ts`** exports.

ESLint encodes that file as **`domain-application-anti-corruption-layer-api`**. **`layout`** and **`domain-application`** may depend on it (see [Allowed dependency directions](#allowed-dependency-directions-summary)); features typically talk to their own **`domain-application-api`** and delegate outward via ACL imports where allowed.

### What the ACL exposes

1. **Slices of domain state (read side)**  
   The owning domain keeps full state and rules inside **`application/`** (for example a **`signalStore`**). The ACL exposes **narrow, stable read APIs**—often injectable **adapters** that forward **computed signals** or small methods—so outsiders see cart totals, badges, or quantities **without** importing **`CartStore`** (or equivalent) by type. That protects invariants and lets the domain rename or refactor internal application code without breaking every consumer.

2. **Cross-domain commands via NgRx Signal Store events**  
   When another domain needs to **mutate** state owned elsewhere (for example **Catalog** changing **Cart** quantities), **writes** go **only** through [NgRx Signal Store — Events](https://ngrx.io/guide/signals/signal-store/events) (see also [@ngrx/signals/events](https://ngrx.io/guide/signals/events) for **`event(...)`** primitives):

   - **`domains/<domain>/application/events.ts`** defines **`event(...)`** descriptors (typed payloads); the owning domain is the **only** place that decides which events outside contexts may dispatch.
   - The owning **`signalStore`** registers **`withReducer(on(...))`** handlers for those events (Signal Store pattern).
   - **`anti-corruption-layer.ts`** **re-exports** the events (and read adapters) so foreign code imports **only** the ACL path and uses **`dispatcher.dispatch(event(payload))`** (or the project’s equivalent). **Consumers must not** call another domain’s **`signalStore`** methods or import its internal **`application`** store type for those mutations.

   This keeps coupling **event-shaped and explicit**: consumers depend on message names and payloads, not on another domain’s internal method surface. **All** cross-domain **command** entry points the owner allows must appear as **events** on the ACL—not as ad-hoc public store APIs.

### When to keep state in the domain vs move it under `core`

| Situation                                                                                             | Placement                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Other bounded contexts need **only selected projections or commands** (badge count, “add line”, etc.) | Keep authoritative state in **`domains/<domain>/application`**. Expose reads/commands **only** through **`anti-corruption-layer.ts`** (adapters + re-exported events).                                                                                                                                                                            |
| Other domains (or widespread shell code) need **the full domain state model** as one cohesive thing   | Move stores and related logic under **`core/<domain>/`**, mirroring **`application/`**, **`domain/`**, and **`infrastructure/`** as in [Core folder layout](#core-folder-layout). Expose **`core-api`** via **`core/**/public-api.ts`**. Bounded **`domains/<domain>/`** code then depends on **`core-api`\*\* instead of owning duplicate state. |

The second case avoids pretending a globally shared store is still “private” to one folder while every consumer imports deep internals.

### Rules of thumb

- **Do not** inject another domain’s **`signalStore`** / facade from outside that domain for **mutations**; use dispatched **ACL‑re‑exported events**. Use **ACL read adapters** for projections.
- **Do** define events next to the reducer that owns them; **re-export** from **`anti-corruption-layer.ts`** for cross-domain imports.
- **Promote to `core/<domain>/`** (with **`application`**, **`domain`**, **`infrastructure`** mirroring `domains/`) when consumers need the **entire** state shape and an ACL would duplicate the store anyway.

---

## Boundary element types (path → type)

These definitions come from `settings.boundaries.elements` in `apps/ecommerce/eslint.config.mjs`:

| Element type                                   | Detection                                        | Notes                                        |
| ---------------------------------------------- | ------------------------------------------------ | -------------------------------------------- |
| `main`                                         | File `main.ts`                                   | Entry only.                                  |
| `app`                                          | `app.ts`, `app.config.ts`, `app.routes.ts`, etc. | Application shell.                           |
| `env`                                          | Path `environments`                              | Config.                                      |
| `themes`                                       | Path `themes`                                    | Theming.                                     |
| `core-api`                                     | `core/**/public-api.ts`                          | Allowed dependency surface for `core`.       |
| `core`                                         | Path `core`                                      | Implementation of core.                      |
| `ui-api`                                       | `ui/**/public-api.ts`                            | Public UI kit surface.                       |
| `ui`                                           | Path `ui`                                        | UI implementation.                           |
| `layout`                                       | Path `layout`                                    | Layout shell.                                |
| `pattern-api`                                  | `pattern/**/public-api.ts`                       | Pattern public API.                          |
| `pattern`                                      | Path `pattern`                                   | Pattern implementation.                      |
| `domain-routes`                                | `domains/*/api/*.routes.ts`                      | **(+ `domain`)** Route tables.               |
| `domain-feature`                               | `domains/*/feat-(*)`                             | **(+ `domain`, `feature`)** Routed features. |
| `domain-shared`                                | `domains/*/feat-shared`                          | **(+ `domain`)** Intra-domain shared UI.     |
| `domain-application-api`                       | `domains/*/application/public-api.ts`            | Application façade/store surface.            |
| `domain-application-anti-corruption-layer-api` | `domains/*/application/anti-corruption-layer.ts` | ACL exports.                                 |
| `domain-application`                           | `domains/*/application`                          | Application layer implementation.            |
| `domain-business-api`                          | `domains/*/domain/public-api.ts`                 | Domain model surface.                        |
| `domain-business`                              | `domains/*/domain`                               | Pure domain.                                 |
| `domain-infrastructure-api`                    | `domains/*/infrastructure/public-api.ts`         | Infrastructure surface.                      |
| `domain-infrastructure`                        | `domains/*/infrastructure`                       | HTTP clients and **local wire/DTO types only** (no `domain/` imports). |
| `domain-presentation-api`                      | `domains/*/presentation/public-api.ts`           | Reserved public slice (optional).            |
| `domain-presentation`                          | `domains/*/presentation`                         | Reserved slice (optional).                   |
| `lib-api`                                      | `libs/*/src/public-api.ts`                       | **(+ `lib`)** Library entry.                 |
| `lib`                                          | `libs/*`                                         | Library internals.                           |

Imports that do not match an allowed **`from` → `to`** pair are rejected (**`default: 'disallow'`** on unknown relations).

---

## Allowed dependency directions (summary)

The following is a concise reading of **`boundaries/element-types`** rules (not every nuance of captured variables).

- **`main`** → `app`, `env`.
- **`core`** → `env`, self, **`lib-api`** (libraries only through their public API).
- **`ui`** → `lib-api`, self.
- **`layout`** → `lib-api`, `env`, **`core-api`**, **`ui-api`**, **`pattern-api`**, self, **`domain-routes`**, **`domain-application-anti-corruption-layer-api`** (layout composes shells and may touch ACL surfaces explicitly listed).
- **`app`** → `themes`, `lib-api`, self, `env`, **`core-api`**, **`layout`**, **`ui-api`**, **`domain-routes`**.
- **`pattern`** → `lib-api`, `env`, **`core-api`**, **`ui-api`**.
- **`domain-routes`** → `lib-api`, `env`, **`core-api`**, **`pattern-api`**, other domains’ **`domain-routes`** only (**different** `domain`), same-domain **`domain-feature`**, **`domain-infrastructure-api`**, **`domain-application-api`**.
- **`domain-infrastructure`** → `env`, **`core-api`**, same-domain **`domain-infrastructure`** only (no **`domain/`**, no cross-domain infra).
- **`domain-business`** → same-domain **`domain-business`** only (pure domain isolation).
- **`domain-feature`** → `env`, **`core-api`**, **`pattern-api`**, **`ui-api`**, `lib-api`, same **feature** only for other **`domain-feature`**, **`domain-application-api`**, **`domain-shared`** (same domain).
- **`domain-application`** → `env`, **`core-api`**, `lib-api`, **`domain-application-anti-corruption-layer-api`**, same-domain **`domain-infrastructure-api`** (store injects API façade only through the infrastructure barrel), same **feature** for **`domain-application`**, **`domain-business-api`** (same domain).
- **`domain-application-anti-corruption-layer-api`** → **`domain-application-api`** or self (ACL stays next to application).
- **`domain-shared`** → `env`, **`core-api`**, **`pattern-api`**, **`ui-api`**.
- **`lib-api`** → **`lib`** with matching **`app`** / **`lib`** capture (library internals stay inside the library).
- **`lib`** → **`lib`** (same library).

This yields the intended **hexagonal / clean architecture** flow inside each domain: **routes → feature UI → application → domain**, with **infrastructure** exposing **wire-typed** clients behind **`domain-infrastructure-api`**, **application** translating wire → domain where needed, and **libraries** only via **`public-api.ts`**.

---

## Public API convention

Within the app and in libs, consumers should import from **`public-api.ts`** barrels where those element types exist (`core-api`, `ui-api`, `domain-*-api`, `lib-api`). That keeps refactor-safe surfaces and satisfies boundary classification (files under `public-api.ts` paths are typed differently from their sibling implementation folders).

---

## Shared libraries (`libs/`)

Libraries are the primary mechanism for **sharing behavior across multiple apps** (auth, API helpers, UI primitives, state utilities):

- Entry point: **`libs/<library>/src/public-api.ts`** (classified as **`lib-api`** from the app’s perspective).
- Implementation folders fall under **`lib`**; **`lib-api`** may depend only on **`lib`** for the **same** captured library name.

Examples in this workspace include **`shared`** (UI/widgets/pipes), **`auth`** / **`auth-web`**, **`api`**, **`store`**—each with its own `project.json` and Nx **`tags`**.

When logic is **specific to one product domain** (for example “products catalog”), it usually stays under **`apps/<app>/src/app/domains/...`**. When it is **generic across apps**, promote it to **`libs/<name>`** and depend on **`lib-api`** only.

---

## Routing composition

Top-level routes (`app.routes.ts`) typically lazy-load **layout** routes; layout routes lazy-load **domain route modules** under `domains/<domain>/api/*.routes.ts`. Domain routes then **`loadComponent`** (or load feature routes) from **`feat-*`**, keeping **route configuration** in **`domain-routes`** separate from page implementation.

---

## Adding a new domain or feature (checklist)

1. Create **`domains/<domain>/`** with **`api/`**, **`application/`**, **`domain/`**, **`infrastructure/`**, and **`feat-<name>/`** as needed.
2. Add **`public-api.ts`** barrels at each layer boundary you intend others to import. Define **HTTP/wire types** under **`infrastructure/*.model.ts`** (no imports from **`domain/`**). Map wire → domain in **`application/`** (mappers, stores) before exposing domain-shaped state. If other domains must interact with this one, add **`application/events.ts`** (NgRx Signals events + reducers on the owning store) and **`application/anti-corruption-layer.ts`** (re-exports + read adapters); keep **`domain-application`** as the internal surface and **`anti-corruption-layer.ts`** as the only cross-domain import path.
3. Wire **`domains/<domain>/api/*.routes.ts`** from **`layout`** or parent routes via **`loadChildren`** / **`import()`**.
4. Prefer **`domain-shared`** only for UI reused **inside** the same domain.
5. If **one piece of UI and business logic** is shared across contexts but **does not belong to a single domain**, add **`pattern/<name>/`** and expose **`pattern/**/public-api.ts`** (**`pattern-api`\*\*); see [Pattern folder](#pattern-folder).
6. Extract to **`libs/`** when two or more apps need the same capability; expose **`src/public-api.ts`** and add appropriate Nx **`tags`**.
7. Run ESLint on the app; **`boundaries/element-types`** should flag illegal imports early.

---

## Reference files

- Workspace ESLint base: `eslint.config.mjs`
- Ecommerce DDD + Angular boundaries: `apps/ecommerce/eslint.config.mjs`
- Backend modular slice layout (NestJS): `docs/nestjs-architecture.md`
