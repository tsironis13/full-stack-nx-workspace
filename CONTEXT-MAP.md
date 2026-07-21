# Context map

This Nx workspace ships several applications and libraries. **Domain language** (terms experts use, relationships, ambiguities) lives in per-area `CONTEXT.md` files linked below. **Workspace engineering** notes (stacks, tooling, infra) stay in `docs/*.md`; they are not substitutes for a domain context.

## Contexts

Each third column lists **Nx project IDs**: the `name` field from each project’s `project.json` / `package.json` — the same identifiers you use in `nx run <name>:<target>` and in `nx graph`.

| Context        | Language file                                            | Nx project IDs for this context                                                                                                                       |
| -------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E-commerce** | [docs/ecommerce/CONTEXT.md](./docs/ecommerce/CONTEXT.md) | Primary: `ecommerce`, `ecommerce-api`, `business-portal`, `business-portal-api`, `store`, `api`. Shared libs used here: `auth`, `auth-web`, `shared`. |

Add a new row here when a bounded context gets its own glossary (e.g. a separate product with different domain language).

## Workspace engineering (system-wide)

These documents apply across Nx apps and libraries. They are **not** domain `CONTEXT.md` files and do not define product language; they describe **how** the repo is shaped and built.

| Document                                                               | Scope                                                                                                                |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [docs/front-end-infrastructure.md](./docs/front-end-infrastructure.md) | Angular apps, DDD-oriented layering, ESLint / module boundaries, shared `libs/` patterns for the monorepo front end. |
| [docs/nestjs-architecture.md](./docs/nestjs-architecture.md)           | NestJS + Drizzle, modular monolith / clean-architecture patterns for backend apps in this workspace.                 |

Keep them at **`docs/<doc>.md`** (top-level under `docs/`), not under `docs/ecommerce/`, unless you later split a doc so it only applies to one product.

## Relationships

- **Storefront vs business portal** — **Two** storefront Angular applications target shoppers; **`business-portal`** targets **Admin User** workflows. All implement the **E-commerce** context described in `docs/ecommerce/CONTEXT.md`; they are different UIs over the same domain, not separate glossaries today.
- **APIs** — **`ecommerce-api`** exposes HTTP for **both** storefront Angular applications. **`business-portal-api`** exposes HTTP for **`business-portal`** only. Domain terms in `docs/ecommerce/CONTEXT.md` apply across these clients unless you split a context later.
- **Libraries** — `libs/auth`, `libs/auth-web`, and `libs/shared` provide technical capabilities; they do not define a parallel domain context until you add a dedicated `CONTEXT.md` for them.

## ADRs

- Workspace-wide or cross-context decisions: `docs/adr/` (see [.cursor/skills/domain-modeling-overlay/ADR-FORMAT.md](.cursor/skills/domain-modeling-overlay/ADR-FORMAT.md)).
- Decisions that only concern the e-commerce model: optional `docs/ecommerce/adr/`, same numbering style locally, or reference the workspace series if you prefer a single stream.

## Discoverability

1. Open this file to see which contexts exist, where language lives, and where system-wide engineering docs are.
2. Edit the `CONTEXT.md` for the area you are working in; do not duplicate glossaries at the repo root.
