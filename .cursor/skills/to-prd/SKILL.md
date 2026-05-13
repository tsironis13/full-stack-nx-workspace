---
name: to-prd
description: Turn the current conversation context into a PRD and publish it to the project issue tracker. Use when user wants to create a PRD from the current context.
---

This skill takes the current conversation context and codebase understanding and produces a PRD. Do NOT interview the user — just synthesize what you already know.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-skills` if not.

## Repo alignment (this Nx workspace)

Before framing implementation, align language with how this monorepo is shaped:

1. **[CONTEXT-MAP.md](../../../CONTEXT-MAP.md)** — bounded contexts, links to **`docs/<area>/CONTEXT.md`**, and **Nx project IDs** (`project.json` / `package.json` `name`) for each app or library.
2. **`docs/front-end-infrastructure.md`** — Angular apps: DDD-oriented folders under `apps/<app>/src/app` (`domains/<domain>/`, `core/`, `ui/`, `layout/`, `pattern/`), **`libs/`** shared libraries with **`public-api.ts`** entry surfaces, Nx tags, and ESLint module boundaries.
3. **`docs/nestjs-architecture.md`** — NestJS modular monolith: feature modules, Presentation → Application → Domain → Infrastructure, Drizzle behind repositories, dependency rule (domain does not depend on Nest/Drizzle).
4. **`docs/adr/`** and optional **`docs/<area>/adr/`** — record or respect existing architecture decisions.

Use **Nx project IDs** and **domain glossary terms** from the relevant `CONTEXT.md` in the PRD prose (not raw filesystem paths in the template sections — see below).

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's **domain glossary** vocabulary throughout the PRD, and respect ADRs that touch the area.

2. Sketch **what will be built or changed** in terms this workspace uses:

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

3. Write the PRD using the template below, then publish it to the project issue tracker. Apply the `ready-for-agent` triage label — no need for additional triage.

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- **Nx**: apps and `libs/` projects affected; shared vs app-local code; tags/boundary considerations.
- **Angular**: domains, features, application facades/stores, ACLs, routing/resolvers — described by responsibility and stable export surfaces, not exhaustive file trees.
- **NestJS**: modules and layers; use cases; persistence boundaries (Drizzle); external integrations.
- Technical clarifications from the developer
- Architectural decisions (including pointers to ADRs when relevant)
- Schema / persistence changes
- HTTP API contracts (shape of endpoints and payloads)

Do NOT include specific file paths or application code snippets as the primary spec. They go stale quickly.

**Exception:** If a prototype encodes a decision more precisely than prose (for example a **Drizzle schema fragment**, **DTO / response type shape**, **command/query handler signature**, **NgRx Signals event or store shape**, **route configuration sketch**, or **OpenAPI-style contract excerpt**), inline only the decision-rich fragment and note briefly that it came from a prototype. Trim to what fixes the contract — not a full demo.

## Testing Decisions

A list of testing decisions that were made. Include:

- What counts as a good test here (behaviour and public surfaces — for Angular, avoid brittle coupling to private component internals; for Nest, favour domain/use-case tests where valuable).
- Which **Nx projects** or layers will get tests (e.g. `nx test <project-id>`).
- Prior art: similar tests already in the codebase (Angular specs, Nest unit/e2e patterns).

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>
