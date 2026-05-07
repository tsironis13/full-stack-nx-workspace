# Context map

This Nx workspace ships several applications and libraries. **Domain language** (terms experts use, relationships, ambiguities) lives in per-area `CONTEXT.md` files linked below. **Workspace engineering** notes (stacks, tooling, infra) stay in `docs/*.md`; they are not substitutes for a domain context.

## Contexts

Each third column lists **Nx project IDs**: the `name` field from each project’s `project.json` / `package.json` — the same identifiers you use in `nx run <name>:<target>` and in `nx graph`.

| Context        | Language file                                            | Nx project IDs for this context                                                                                     |
| -------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **E-commerce** | [docs/ecommerce/CONTEXT.md](./docs/ecommerce/CONTEXT.md) | Primary: `ecommerce`, `ecommerce-api`, `business-portal`, `business-portal-api`, `store`, `api`. Shared libs used here: `auth`, `auth-web`, `shared`. |

Add a new row here when a bounded context gets its own glossary (e.g. a separate product with different domain language).

## Relationships

- **Storefront vs business portal** — Both Angular apps implement the **E-commerce** context: the storefront (`ecommerce`) targets shoppers; the business portal (`business-portal`) targets **Admin User** workflows described in that context. They are different UIs over the same domain, not separate glossaries today.
- **APIs** — `ecommerce-api` and `business-portal-api` expose HTTP surface area for those clients; domain terms in `docs/ecommerce/CONTEXT.md` apply to both unless you split a context later.
- **Libraries** — `libs/auth`, `libs/auth-web`, and `libs/shared` provide technical capabilities; they do not define a parallel domain context until you add a dedicated `CONTEXT.md` for them.

## ADRs

- Workspace-wide or cross-context decisions: `docs/adr/` (see [.cursor/skills/grill-with-docs/ADR-FORMAT.md](.cursor/skills/grill-with-docs/ADR-FORMAT.md)).
- Decisions that only concern the e-commerce model: optional `docs/ecommerce/adr/`, same numbering style locally, or reference the workspace series if you prefer a single stream.

## Discoverability

1. Open this file to see which contexts exist and where language lives.
2. Edit the `CONTEXT.md` for the area you are working in; do not duplicate glossaries at the repo root.
