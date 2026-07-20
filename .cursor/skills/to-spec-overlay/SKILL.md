---
name: to-spec-overlay
description: Workspace overlay for to-spec — turn conversation context into a spec and publish it. Use when user wants to create a spec or PRD from the current context in this Nx workspace.
---

Workspace overlay for the base `to-spec` skill. Do NOT interview the user — just synthesize what you already know.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-skills` if not.

## Base skill (required first)

Read and follow `~/.agents/skills/to-spec/SKILL.md` end-to-end (explore → seams check with the user → write from its `<spec-template>` → publish to the issue tracker → apply `ready-for-agent`).

Do **not** invent a second template or publish path. Apply the overlay below while running that process.

## Repo alignment (this Nx workspace)

Before framing implementation, align language with how this monorepo is shaped:

1. **[CONTEXT-MAP.md](../../../CONTEXT-MAP.md)** — bounded contexts, links to **`docs/<area>/CONTEXT.md`**, and **Nx project IDs** (`project.json` / `package.json` `name`) for each app or library.
2. **`docs/front-end-infrastructure.md`** — Angular apps: DDD-oriented folders under `apps/<app>/src/app` (`domains/<domain>/`, `core/`, `ui/`, `layout/`, `pattern/`), **`libs/`** shared libraries with **`public-api.ts`** entry surfaces, Nx tags, and ESLint module boundaries.
3. **`docs/nestjs-architecture.md`** — NestJS modular monolith: feature modules, Presentation → Application → Domain → Infrastructure, Drizzle behind repositories, dependency rule (domain does not depend on Nest/Drizzle).
4. **`docs/adr/`** and optional **`docs/<area>/adr/`** — record or respect existing architecture decisions.

Use **Nx project IDs** and **domain glossary terms** from the relevant `CONTEXT.md` in the spec prose (not raw filesystem paths in the template sections — see below).

## Process overlay

While following the base `to-spec` process, specialize these steps for this workspace:

1. **Explore** — same as the base skill, and apply **Repo alignment** above. Use the project’s **domain glossary** vocabulary throughout the spec, and respect ADRs that touch the area.

2. **Sketch what will be built or changed** (this is how this workspace expresses the base skill’s seam sketch). Prefer existing seams; aim for the fewest cohesive public surfaces.

   **Monorepo / Nx**

   - Which **apps** and **`libs/`** libraries are in scope (by **Nx project ID** from CONTEXT-MAP / `project.json`).
   - Whether work stays inside one app or needs a **new or extended shared library** (`public-api.ts` as the consumption surface).
   - Whether changes must satisfy **`@nx/enforce-module-boundaries`** and app-specific rules (e.g. `eslint-plugin-boundaries` where enabled).

   **Angular (front end)**

   - Which **vertical slices** under **`domains/<domain>/`** matter: lazy **`api/*.routes.ts`**, **`feat-*`**, **`application/`** (stores, facades, ACL), **`domain/`**, **`infrastructure/`** — or shell pieces under **`layout/`**, **`pattern/`**, **`core/`**, **`ui/`**.
   - Prefer describing **stable façade surfaces** (barrels like **`domain-application-api`**, **`pattern-api`**, **`lib-api`**) over listing deep internal files.
   - When one domain triggers mutations in another (**Catalog → Cart**, etc.), spell out **[NgRx Signal Store Events](https://ngrx.io/guide/signals/signal-store/events)** as the cross-domain write path: owning domain publishes **re-exported events** via **`anti-corruption-layer.ts`**; consumers **dispatch only** — see **`docs/front-end-infrastructure.md`**.

   **NestJS (back end)**

   - Which **feature modules** and **layers** are touched: HTTP/DTOs vs application services vs domain entities/rules vs Drizzle repositories and mappers.
   - Keep **domain** free of Nest/Drizzle imports when documenting intent (matches `docs/nestjs-architecture.md`).

   Aim for **cohesive, testable units with small public surfaces**: thin route wiring, curated **`public-api.ts`** exports, Nest modules that expose only what other modules need.

   Check with the user that this breakdown matches their expectations. Check which **Nx projects** or slices they want tests emphasized on.

3. **Write and publish** — use the base skill’s `<spec-template>` and publish steps. When filling **Implementation Decisions** and **Testing Decisions**, prefer the framings below (still no raw filesystem paths as the primary spec).

### Implementation Decisions (overlay)

Prefer these over generic “modules” wording:

- **Nx**: apps and `libs/` projects affected; shared vs app-local code; tags/boundary considerations.
- **Angular**: domains, features, application facades/stores, ACLs, routing/resolvers — described by responsibility and stable export surfaces, not exhaustive file trees.
- **NestJS**: modules and layers; use cases; persistence boundaries (Drizzle); external integrations.
- Technical clarifications from the developer
- Architectural decisions (including pointers to ADRs when relevant)
- Schema / persistence changes
- HTTP API contracts (shape of endpoints and payloads)

Do NOT include specific file paths or application code snippets as the primary spec. They go stale quickly.

**Exception:** If a prototype encodes a decision more precisely than prose (for example a **Drizzle schema fragment**, **DTO / response type shape**, **command/query handler signature**, **NgRx Signals event or store shape**, **route configuration sketch**, or **OpenAPI-style contract excerpt**), inline only the decision-rich fragment and note briefly that it came from a prototype. Trim to what fixes the contract — not a full demo.

### Testing Decisions (overlay)

Include:

- What counts as a good test here (behaviour and public surfaces — for Angular, avoid brittle coupling to private component internals; for Nest, favour domain/use-case tests where valuable).
- Which **Nx projects** or layers will get tests (e.g. `nx test <project-id>`).
- Prior art: similar tests already in the codebase (Angular specs, Nest unit/e2e patterns).
