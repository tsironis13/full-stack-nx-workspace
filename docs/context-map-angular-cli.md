# Context map

This Angular CLI multi-project workspace ships several applications and libraries. **Applications** live under **`projects/<app>/`** (`"newProjectRoot": "projects"` in `angular.json`). **Libraries** live under **`libs/<lib>/`**. **Domain language** (terms experts use, relationships, ambiguities) lives in per-area `CONTEXT.md` files linked below. **Workspace engineering** notes (stacks, tooling, infra) stay in `docs/*.md`; they are not substitutes for a domain context.

```
/
├── angular.json                      ← project names; newProjectRoot "projects"
├── CONTEXT-MAP.md
├── docs/
│   ├── adr/                          ← workspace-wide ADRs
│   ├── front-end-infrastructure-angular-cli.md
│   └── <area>/
│       ├── CONTEXT.md
│       └── adr/                      ← optional context-scoped ADRs
├── projects/
│   └── <app>/                        ← Angular applications
└── libs/
    └── <lib>/                        ← Angular libraries
```

## Contexts

Each third column lists **Angular CLI project names**: the keys under `projects` in the root **`angular.json`** — the same identifiers you use in `ng serve <name>`, `ng build <name>`, `ng test <name>`, and `ng lint <name>`. Application roots are `projects/<name>`. Library roots are `libs/<name>`.

| Context        | Language file                                | Angular CLI project names for this context                                                                                          |
| -------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **E-commerce** | [ecommerce/CONTEXT.md](./ecommerce/CONTEXT.md) | Applications (`projects/`): `ecommerce`, `business-portal`. Libraries (`libs/`): `store`, `api`, `auth`, `auth-web`, `shared`. |

Add a new row here when a bounded context gets its own glossary (e.g. a separate product with different domain language).

## Workspace engineering (system-wide)

These documents apply across Angular CLI applications and libraries. They are **not** domain `CONTEXT.md` files and do not define product language; they describe **how** the repo is shaped and built.

| Document                                                                                         | Scope                                                                                                                |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| [front-end-infrastructure-angular-cli.md](./front-end-infrastructure-angular-cli.md)             | Angular applications under `projects/`, DDD-oriented layering, ESLint / module boundaries, shared `libs/` patterns. |
| [nestjs-architecture.md](./nestjs-architecture.md)                                               | NestJS + Drizzle, modular monolith / clean-architecture patterns for backend apps when they live in this workspace. |

Keep them at **`docs/<doc>.md`** (top-level under `docs/`), not under `docs/ecommerce/`, unless you later split a doc so it only applies to one product.

## Relationships

- **Storefront vs business portal** — Storefront Angular applications under **`projects/`** target shoppers; **`business-portal`** (`projects/business-portal`) targets **Admin User** workflows. All implement the **E-commerce** context described in `docs/ecommerce/CONTEXT.md`; they are different UIs over the same domain, not separate glossaries today.
- **APIs** — **`ecommerce-api`** exposes HTTP for the storefront Angular applications under **`projects/`**. **`business-portal-api`** exposes HTTP for **`business-portal`** only. Those APIs are not Angular CLI application projects. Domain terms in `docs/ecommerce/CONTEXT.md` apply across these clients unless you split a context later.
- **Shopping Assistant vs storefront catalog** — Need-language **Product recommendations** are a **Shopping Assistant** behavior (chat in **`projects/ecommerce`**, ranking HTTP on **`ecommerce-api`**). **Storefront catalog search** stays **`products.name`** only. Same e-commerce glossary; different shopper entry points.
- **Shopping Assistant vs Cart Item workflow** — Same storefront chat in **`projects/ecommerce`**. **Shopping Assistant** (`shoppingAgent` in **`ai-server`**) retrieves **Products** and may start a **Cart Item workflow** as a tool. The workflow emits A2UI from step results; **`projects/ecommerce`** `CartStore` writes the **Cart Item**. Not a sub-agent; not **Checkout**. Decision records: [0006](./ecommerce/adr/0006-cart-item-workflow-stock-and-cartstore.md), [0007](./ecommerce/adr/0007-cart-item-workflow-mastra-not-subagent.md).
- **Libraries** — `libs/auth`, `libs/auth-web`, and `libs/shared` provide technical capabilities; they do not define a parallel domain context until you add a dedicated `CONTEXT.md` for them.

## ADRs

- Workspace-wide or cross-context decisions: `docs/adr/` (see [ADR-FORMAT.md](../.cursor/skills/domain-modeling-overlay/ADR-FORMAT.md)).
- Decisions that only concern the e-commerce model: optional `docs/ecommerce/adr/`, same numbering style locally, or reference the workspace series if you prefer a single stream.

## Discoverability

1. Open this file to see which contexts exist, where language lives, and where system-wide engineering docs are.
2. Edit the `CONTEXT.md` for the area you are working in; do not duplicate glossaries at the repo root.
