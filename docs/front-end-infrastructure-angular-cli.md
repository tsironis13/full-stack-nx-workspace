# Front-end infrastructure (Angular CLI multi-project workspace)

This document describes how front-end applications are structured in an **Angular CLI multi-project workspace**, with emphasis on **domain-driven design (DDD)** layering and **enforceable module boundaries**. The canonical reference for those rules is the workspace root ESLint configuration (`eslint.config.mjs`), which adds [`eslint-plugin-boundaries`](https://github.com/javierbrea/eslint-plugin-boundaries) in **strict** mode. Each app’s config (`projects/<app>/eslint.config.mjs`) extends that root file and inherits the boundary rules.

Throughout this document, **`<app>`** is a placeholder for any application under `projects/*/` (for example `projects/<app>/src/app`), and **`<lib>`** is a placeholder for any library under `libs/*/`.

---

## Workspace context

- The **Angular CLI** manages all projects and libraries from a single root **`angular.json`**. Each app/library is a **project** entry with its own `root`, `sourceRoot`, and architect targets (`ng serve <app>`, `ng build <app>`, `ng test <app>`, `ng lint <app>`).
- Projects are created with the CLI against a workspace created without a default app (see [Creating projects](#creating-projects)).
- **Cross-app reuse** belongs in **`libs/`** libraries (built with **ng-packagr**), not by copying folders between projects. Libraries expose a single entry surface via `libs/<lib>/src/public-api.ts` (see [Shared libraries](#shared-libraries-libs)).
- **Module boundaries** (app → library, library → library, and in-app DDD layers) live in the root `eslint.config.mjs`. The Angular CLI has no project graph or tag constraints, so these rules are expressed with **`eslint-plugin-boundaries`** over `projects/*` and `libs/*`: folder **`boundaries/elements`**, file **`boundaries/files`**, and **`boundaries/dependencies`** policies (see [Root: `eslint.config.mjs`](#root-eslintconfigmjs)). Each app’s `projects/<app>/eslint.config.mjs` extends the root config and inherits those rules.

### Creating projects

```bash
ng new <workspace> --no-create-application
ng generate application <app> --project-root projects/<app>
ng generate library <lib> --project-root libs/<lib>
```

Setting `"newProjectRoot": "projects"` in `angular.json` makes `projects/` the default for applications; libraries should always pass `--project-root libs/<lib>` so projects and libraries stay in separate top-level folders.

---

## ESLint configuration layers

Linting is added with **`ng add angular-eslint`**, which registers the `@angular-eslint/builder:lint` builder as each project’s `lint` target and generates flat configs.

### Root: `eslint.config.mjs`

The root config applies the **`angular-eslint`** and **`typescript-eslint`** flat presets (`angular.configs.tsRecommended`, `angular.configs.templateRecommended`) to all matching files. It is also the **only** place that defines module boundaries, in three sections:

1. **`boundaries/elements`** — folder selectors. Each entry has a **`type`**, a path **`pattern`**, and optional **`capture`** groups (`project`, `domain`, `feature`, `lib`). Slice patterns start at `src/app` so they stay **inside** the parent **`project`** element (`projects/*`) instead of replacing it.
2. **`boundaries/files`** — file selectors for entry files and barrels (`main.ts`, `app.ts`, `public-api.ts`, `*.routes.ts`, `anti-corruption-layer.ts`). Each entry has a **`category`**, a path **`pattern`**, and optional **`capture`** groups. A public barrel is a file category that sits inside a folder element; a policy that means “the barrel only” names **both**.
3. **`boundaries/dependencies`** — the allow/deny graph. **`default: 'disallow'`**. Each policy has a **`from`** selector and an **`allow.to`** list (or a **`disallow`** pair). Selectors use `element.type`, `file.categories`, and captured values (`{{ from.element.captured.domain }}`, `{{ from.file.captured.domain }}`). Two trailing **`disallow`** policies (last match wins) reject imports whose captured **`project`** differs from the importer’s, including slices that only have `project` on their parent element.

**`boundaries.configs.strict`** is merged into the rules. **`boundaries/dependency-nodes`** is `import` and `dynamic-import`, so lazy-loaded routes are checked. **`boundaries/root-path`** is the workspace root so the patterns above resolve from there.

Because libraries are imported through TypeScript path aliases (for example `@<scope>/<lib>`), the boundaries plugin needs **`eslint-import-resolver-typescript`** in `settings['import/resolver']` so aliases resolve to their source `public-api.ts` files and get classified correctly.

There are no Nx-style `tags`; if you need categories of libraries (for example `ui`, `data-access`, `util`), encode them in the **folder name** (`libs/ui-<name>`, `libs/data-access-<name>`) and capture them in the boundaries element pattern.

### App: `projects/<app>/eslint.config.mjs`

Each app config extends the root with `defineConfig` and does not redeclare boundary rules. It only sets Angular selector prefixes (match the project’s `prefix` in `angular.json`) and an empty HTML rules block:

```js
import { defineConfig } from 'eslint/config';
import rootConfig from '../../eslint.config.mjs';

export default defineConfig([
  ...rootConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
]);
```

---

## Architectural model (DDD-oriented)

Each app treats **`projects/<app>/src/app`** as a bounded composition root:

| Area                       | Role                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`main`**, **`app`**      | Bootstrap and shell (`main.ts`, `app.ts`, `app.config.ts`, routes, specs).                                                                                                                                                                                                                                                                                                             |
| **`core`**                 | App-wide singleton-style services, utilities, interceptors; exposes `core/**/public-api.ts` as **`core-api`**. When **another domain needs the owning bounded context’s entire state** (not just a curated ACL slice), that capability lives under **`core/<domain>/`** using the **same layered folders as under `domains/<domain>/`**—see [Core folder layout](#core-folder-layout). |
| **`ui`**                   | Shared presentational building blocks for this app; `ui/**/public-api.ts` → **`ui-api`**.                                                                                                                                                                                                                                                                                              |
| **`pattern`**              | Cross-cutting **UI together with behaviour** that **does not belong to a single domain**; reusable slices multiple bounded contexts can compose without owning them under **`domains/<name>/`**. `pattern/**/public-api.ts` → **`pattern-api`**. See [Pattern folder](#pattern-folder).                                                                                                |
| **`layout`**               | Shell layout, navigation chrome, top-level route wiring that stitches domains together.                                                                                                                                                                                                                                                                                                |
| **`themes`**, **`env`**    | Theming and environment configuration.                                                                                                                                                                                                                                                                                                                                                 |
| **`domains/<domain>/...`** | Per-domain vertical slices: routes, features, application, domain model, infrastructure, optional shared UI within the domain.                                                                                                                                                                                                                                                         |
| **`libs/...`**             | Shared code across projects; consumed through **`lib-api`** (`libs/*/src/public-api.ts`).                                                                                                                                                                                                                                                                                              |

Boundary enforcement distinguishes **route definitions** (`domains/*/api/*.routes.ts`) from **implementation** folders so routing stays thin and dependencies stay predictable.

---

## Layout folder

**Purpose:** **`layout/`** holds the **application shell**—persistent chrome and routing glue that spans domains but **is not** a business bounded context itself. Typical contents: header, navigation, **`RouterOutlet`** hosts for lazy domain trees, and route modules that **compose** those domains (for example under **`layout/navigation/`**).

**Why not inside `domains/<name>/`?** Each **`domains/<name>/`** slice should stay focused on **that context’s** features, application logic, and infrastructure. Shell UI (global nav, a badge in the header) is **orthogonal** to any single domain. Giving it a dedicated folder avoids folding “the whole app frame” into one arbitrary domain and keeps ownership clear.

**Why not only `app/`?** **`app/`** stays thin: bootstrap, root providers, and top-level **`Route[]`**. Concrete shell components and **nested route trees** under the main frame live under **`layout/`** so composition stays navigable and ESLint can treat **`layout`** as its own **boundary element** with tailored allowed imports.

**Dependency direction:** **`layout`** may wire **`domain-routes`** and consume **`domain-application-anti-corruption-layer-api`** (for example a header badge that reads curated projections without injecting another domain’s store—see [Anti-corruption layer](#anti-corruption-layer-anti-corruption-layerts)). Bounded domains generally **must not** depend on **`layout`**; dependencies flow **shell → domains**, not the reverse. Details align with **`boundaries/dependencies`** in the root **`eslint.config.mjs`**.

See also [Routing composition](#routing-composition).

---

## Pattern folder

**Purpose:** **`pattern/`** is where you put a **cohesive unit of UI and business logic** that **does not fit cleanly inside one bounded context**. If several domains (or layout shell flows) need the same interaction—for example a multi-step widget, a filter panel that orchestrates queries beyond one aggregate, or a compound control—implement it here rather than duplicating under **`domains/<domain>/feat-*`** or parking arbitrary behaviour inside **`layout/`**.

**When to choose `pattern/`:** Ask whether **one domain alone** should own both the visuals **and** the rules.

| Answer                                                                 | Place code                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------- |
| Yes—the behaviour genuinely belongs to one bounded context             | **`domains/<domain>/`** (`feat-*`, `application`, …).   |
| No—it mixes concerns from multiple contexts or is deliberately neutral | **`pattern/`** (consumers depend on **`pattern-api`**). |

**How `pattern/` differs from nearby folders:**

- **`ui/`** — Mostly **presentational** primitives (cards, buttons, dumb widgets). Little or no domain orchestration.
- **`layout/`** — **Shell**: chrome, navigation hosts, wiring **`domain-routes`**. Not the home for arbitrary reusable business-heavy widgets unless they are truly shell-specific.
- **`pattern/`** — **Behaviour-rich reuse**: combines **`ui-api`** / **`core-api`** primitives into something meaningful across contexts.
- **`libs/`** — Same conceptual reuse **across projects in the workspace**; **`pattern/`** is typically **within one Angular app** (still exported via `pattern/**/public-api.ts` for imports).

**Boundaries:** In the root **`eslint.config.mjs`**, **`pattern`** may use **`lib-api`**, **`env`**, **`core-api`**, and **`ui-api`**. **`domain-feature`**, **`domain-shared`**, **`domain-routes`**, and **`layout`** may depend on **`pattern-api`**—so domains compose patterns instead of patterns importing domain internals.

**Illustrative examples:**

| Example                                                                                              | Why `pattern/` and not `domains/<one>/`?                                    |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Saved searches** — saved query chips + “save current filters” surfaced by several domains          | Behaviour + UI are **product-wide**, not owned by one bounded context.      |
| **Compare tray** — floating bar, max N items, clear/remove rules shared by listing + detail pages    | Same orchestration reused across **multiple** domains’ pages.               |
| **Global keyboard shortcut layer** — registers shortcuts and coordinates focus across routed outlets | Neutral infrastructure-feeling UX that **must not** live inside one domain. |

Implementation sketch: **`projects/<app>/src/app/pattern/compare-tray/`** with **`public-api.ts`** exporting **`CompareTrayComponent`** or a small façade; any consumer **`domains/<domain>/feat-<feature>/`** imports **`pattern/compare-tray/public-api.ts`** only (**`pattern-api`**), never deep internals under **`pattern/compare-tray/`**.

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
    *.model.ts                 # types/rules at app-wide scope
  infrastructure/
    public-api.ts
    *.service.ts
    *.api.model.ts             # wire types for HTTP/persistence (mirror domains: infra does not import core/domain/)
```

**`<domain>`** here is the same conceptual name you would use under **`domains/`**. Typically **`api/`** and **`feat-*`** remain under **`domains/`** because they belong to navigation and UX slices; **`core/<domain>/`** holds **shared state, domain logic, and integration** that genuinely spans the app.

Surface **`core-api`** through `core/**/public-api.ts` (often **`core/<domain>/application/public-api.ts`** or a dedicated barrel) so consumers stay consistent with the ESLint **`core-api`** pattern.

**ESLint note:** `domain-application-anti-corruption-layer-api` is a **`boundaries/files`** category for **`domains/*/application/anti-corruption-layer.ts`**. Code under **`core/<domain>/`** is the **`core`** element; prefer **`public-api.ts`** barrels under **`core/`** (file category **`core-api`**) for stable imports until boundary rules are extended for core-local ACL files.

---

## Anti-corruption layer (`anti-corruption-layer.ts`)

In this architecture the **anti-corruption layer (ACL)** is not “the whole application layer”; it is the **single approved foreign-facing surface** for a bounded domain. Other domains, layout, or shell code **must not** reach into that domain’s stores, facades, or internal `application/` modules directly. They interact only with what **`domains/<domain>/application/anti-corruption-layer.ts`** exports.

ESLint encodes that file as **`domain-application-anti-corruption-layer-api`**. **`layout`** and **`domain-application`** may depend on it (see [Allowed dependency directions](#allowed-dependency-directions-summary)); features typically talk to their own **`domain-application-api`** and delegate outward via ACL imports where allowed.

### What the ACL exposes

1. **Slices of domain state (read side)**  
   The owning domain keeps full state and rules inside **`application/`** (for example a **`signalStore`**). The ACL exposes **narrow, stable read APIs**—often injectable **adapters** that forward **computed signals** or small methods—so outsiders see totals, badges, or quantities **without** importing the owning store by type. That protects invariants and lets the domain rename or refactor internal application code without breaking every consumer.

2. **Cross-domain commands via NgRx Signal Store events**  
   When another domain needs to **mutate** state owned elsewhere (for example one domain changing quantities owned by another), **writes** go **only** through [NgRx Signal Store — Events](https://ngrx.io/guide/signals/signal-store/events) (see also [@ngrx/signals/events](https://ngrx.io/guide/signals/events) for **`event(...)`** primitives):

   - **`domains/<domain>/application/events.ts`** defines **`event(...)`** descriptors (typed payloads); the owning domain is the **only** place that decides which events outside contexts may dispatch.
   - The owning **`signalStore`** registers **`withReducer(on(...))`** handlers for those events (Signal Store pattern).
   - **`anti-corruption-layer.ts`** **re-exports** the events (and read adapters) so foreign code imports **only** the ACL path and uses **`dispatcher.dispatch(event(payload))`** (or the project’s equivalent). **Consumers must not** call another domain’s **`signalStore`** methods or import its internal **`application`** store type for those mutations.

   This keeps coupling **event-shaped and explicit**: consumers depend on message names and payloads, not on another domain’s internal method surface. **All** cross-domain **command** entry points the owner allows must appear as **events** on the ACL—not as ad-hoc public store APIs.

### When to keep state in the domain vs move it under `core`

| Situation                                                                                             | Placement                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Other bounded contexts need **only selected projections or commands** (badge count, “add line”, etc.) | Keep authoritative state in **`domains/<domain>/application`**. Expose reads/commands **only** through **`anti-corruption-layer.ts`** (adapters + re-exported events).                                                                                                                                                                      |
| Other domains (or widespread shell code) need **the full domain state model** as one cohesive thing   | Move stores and related logic under **`core/<domain>/`**, mirroring **`application/`**, **`domain/`**, and **`infrastructure/`** as in [Core folder layout](#core-folder-layout). Expose **`core-api`** via `core/**/public-api.ts`. Bounded **`domains/<domain>/`** code then depends on **`core-api`** instead of owning duplicate state. |

The second case avoids pretending a globally shared store is still “private” to one folder while every consumer imports deep internals.

### Rules of thumb

- **Do not** inject another domain’s **`signalStore`** / facade from outside that domain for **mutations**; use dispatched **ACL‑re‑exported events**. Use **ACL read adapters** for projections.
- **Do** define events next to the reducer that owns them; **re-export** from **`anti-corruption-layer.ts`** for cross-domain imports.
- **Promote to `core/<domain>/`** (with **`application`**, **`domain`**, **`infrastructure`** mirroring `domains/`) when consumers need the **entire** state shape and an ACL would duplicate the store anyway.

---

## `boundaries/elements` (folders)

Folder classification in the root `eslint.config.mjs`. Patterns are relative to **`boundaries/root-path`** (the workspace root). Slice patterns start at `src/app` so the **`project`** element (`projects/*`) stays their parent.

| Element type            | Pattern                                | Capture             |
| ----------------------- | -------------------------------------- | ------------------- |
| `env`                   | `projects/*/src/environments`          | `project`           |
| `themes`                | `src/app/themes`                       |                     |
| `core`                  | `src/app/core`                         |                     |
| `ui`                    | `src/app/ui`                           |                     |
| `layout`                | `src/app/layout`                       |                     |
| `pattern`               | `src/app/pattern`                      |                     |
| `domain-shared`         | `src/app/domains/*/feat-shared`        | `domain`            |
| `domain-feature`        | `src/app/domains/*/feat-(*)`           | `domain`, `feature` |
| `domain-infrastructure` | `src/app/domains/*/infrastructure`     | `domain`            |
| `domain-application`    | `src/app/domains/*/application`        | `domain`            |
| `domain-business`       | `src/app/domains/*/domain`             | `domain`            |
| `project`               | `projects/*`                           | `project`           |
| `lib`                   | `libs/*`                               | `lib`               |

`domain-infrastructure` holds HTTP clients and **local wire/DTO types only** (no `domain/` imports).

---

## `boundaries/files` (file categories)

File classification for entry points and barrels. A policy that allows only a barrel pairs the folder **`type`** with the file **`category`**.

| Category                                       | Pattern                                                            | Capture              |
| ---------------------------------------------- | ------------------------------------------------------------------ | -------------------- |
| `main`                                         | `projects/*/src/main.ts`                                           | `project`            |
| `app`                                          | `projects/*/src/app/app.ts`, `app[-.].*.ts`, `app.*.ts`            | `project`            |
| `core-api`                                     | `projects/*/src/app/core/**/public-api.ts`                         | `project`            |
| `ui-api`                                       | `projects/*/src/app/ui/**/public-api.ts`                           | `project`            |
| `pattern-api`                                  | `projects/*/src/app/pattern/**/public-api.ts`                      | `project`            |
| `domain-routes`                                | `projects/*/src/app/domains/*/api/*.routes.ts`                     | `project`, `domain`  |
| `domain-infrastructure-api`                    | `projects/*/src/app/domains/*/infrastructure/public-api.ts`        | `project`, `domain`  |
| `domain-application-anti-corruption-layer-api` | `projects/*/src/app/domains/*/application/anti-corruption-layer.ts` | `project`, `domain` |
| `domain-application-api`                       | `projects/*/src/app/domains/*/application/public-api.ts`           | `project`, `domain`  |
| `domain-business-api`                          | `projects/*/src/app/domains/*/domain/public-api.ts`                | `project`, `domain`  |
| `lib-api`                                      | `libs/*/src/public-api.ts`                                         | `lib`                |

Route and ACL files capture **`domain` on the file**, so same-domain checks in those policies read `from.file.captured.domain`. Folder rules read `from.element.captured.domain` (and `feature` for `domain-feature`).

---

## Allowed dependency directions (summary)

The following is a concise reading of **`boundaries/dependencies`** policies (not every nuance of captured variables). Anything not listed is rejected (`default: 'disallow'`).

Two final **`disallow`** policies, message **“Projects must not import from other projects”**, reject a dependency when the captured **`project`** differs. One compares an element’s own `project` capture; the other compares the parent **`project`** element (`from.element.parents.[0].captured.project`) for slices under `src/app`. Last match wins, so these override an earlier allow across apps. Same-domain infrastructure stays allowed when both sides share that parent project.

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
- **`domain-application`** → `env`, **`core-api`**, `lib-api`, **`domain-application-anti-corruption-layer-api`**, same-domain **`domain-infrastructure-api`** (store injects API façade only through the infrastructure barrel), same-domain **`domain-application`**, **`domain-business-api`** (same domain).
- **`domain-application-anti-corruption-layer-api`** → **`domain-application-api`** or self (ACL stays next to application).
- **`domain-shared`** → `env`, **`core-api`**, **`pattern-api`**, **`ui-api`**.
- **`lib-api`** → **`lib`** with matching **`lib`** capture (library internals stay inside the library).
- **`lib`** → **`lib`** (same library).

This yields the intended **hexagonal / clean architecture** flow inside each domain: **routes → feature UI → application → domain**, with **infrastructure** exposing **wire-typed** clients behind **`domain-infrastructure-api`**, **application** translating wire → domain where needed, and **libraries** only via **`public-api.ts`**.

---

## Public API convention

Within the app and in libs, consumers should import from **`public-api.ts`** barrels. Those barrels are **`boundaries/files`** categories (`core-api`, `ui-api`, `domain-*-api`, `lib-api`) inside the matching **`boundaries/elements`** folder. A policy that means “the barrel only” names both the element type and the file category. That keeps refactor-safe surfaces and satisfies boundary classification.

---

## Shared libraries (`libs/`)

Libraries are the primary mechanism for **sharing behavior across multiple projects** (auth, API helpers, UI primitives, state utilities):

- Generate with **`ng generate library <lib> --project-root libs/<lib>`**. The CLI adds a project entry to `angular.json` (builder `@angular/build:ng-packagr`), an `ng-package.json`, and a **`libs/<lib>/src/public-api.ts`** entry point.
- Entry point: **`libs/<lib>/src/public-api.ts`** (classified as **`lib-api`** from the app’s perspective).
- Implementation folders fall under **`lib`**; **`lib-api`** may depend only on **`lib`** for the **same** captured library name.
- projects import libraries through a **path alias** in the root `tsconfig.json`. The CLI defaults the alias to the built output (`dist/<lib>`), which requires building the library before the app. For in-workspace development and accurate boundary linting, point the alias at source instead:

```json
{
  "compilerOptions": {
    "paths": {
      "@<scope>/<lib>": ["libs/<lib>/src/public-api.ts"]
    }
  }
}
```

When logic is **specific to one product domain**, it usually stays under **`projects/<app>/src/app/domains/...`**. When it is **generic across projects**, promote it to **`libs/<lib>`** and depend on **`lib-api`** only.

---

## Routing composition

Top-level routes (`app.routes.ts`) typically lazy-load **layout** routes; layout routes lazy-load **domain route modules** under `domains/<domain>/api/*.routes.ts`. Domain routes then **`loadComponent`** (or load feature routes) from **`feat-*`**, keeping **route configuration** in **`domain-routes`** separate from page implementation.

---

## Adding a new domain or feature (checklist)

1. Create **`projects/<app>/src/app/domains/<domain>/`** with **`api/`**, **`application/`**, **`domain/`**, **`infrastructure/`**, and **`feat-<name>/`** as needed.
2. Add **`public-api.ts`** barrels at each layer boundary you intend others to import. Define **HTTP/wire types** under **`infrastructure/*.model.ts`** (no imports from **`domain/`**). Map wire → domain in **`application/`** (mappers, stores) before exposing domain-shaped state. If other domains must interact with this one, add **`application/events.ts`** (NgRx Signals events + reducers on the owning store) and **`application/anti-corruption-layer.ts`** (re-exports + read adapters); keep **`domain-application`** as the internal surface and **`anti-corruption-layer.ts`** as the only cross-domain import path.
3. Wire **`domains/<domain>/api/*.routes.ts`** from **`layout`** or parent routes via **`loadChildren`** / **`import()`**.
4. Prefer **`domain-shared`** only for UI reused **inside** the same domain.
5. If **one piece of UI and business logic** is shared across contexts but **does not belong to a single domain**, add **`pattern/<name>/`** and expose `pattern/**/public-api.ts` (**`pattern-api`**); see [Pattern folder](#pattern-folder).
6. Extract to **`libs/`** when two or more projects need the same capability: run **`ng generate library <lib> --project-root libs/<lib>`**, expose **`src/public-api.ts`**, and add the path alias to the root `tsconfig.json`.
7. Run **`ng lint <app>`**; **`boundaries/dependencies`** should flag illegal imports early.

---

## Reference files

- Workspace configuration: `angular.json`, root `tsconfig.json`
- Workspace ESLint (presets + DDD and library boundaries): `eslint.config.mjs`
- Per-app config (extends the root; selector prefix only): `projects/<app>/eslint.config.mjs`
- Per-library packaging: `libs/<lib>/ng-package.json`, `libs/<lib>/src/public-api.ts`
