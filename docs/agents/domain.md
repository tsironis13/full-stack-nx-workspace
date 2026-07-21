# Domain Docs

How engineering agents should consume this repo's domain documentation when exploring the codebase. Canonical **shape and rules** for `CONTEXT.md` / `CONTEXT-MAP.md` live in [.cursor/skills/domain-modeling-overlay/CONTEXT-FORMAT.md](../../.cursor/skills/domain-modeling-overlay/CONTEXT-FORMAT.md); this file applies those **conventions** to navigation and behavior in agents.

## Before exploring, read these

1. **[CONTEXT-MAP.md](../../CONTEXT-MAP.md)** at the workspace root **if it exists** — it lists each bounded context, links to its `CONTEXT.md`, and (in this Nx repo) ties contexts to **Nx project IDs** (`project.json` / `package.json` `name`).

2. **The relevant `CONTEXT.md` file(s)** — resolve via the map (e.g. [docs/ecommerce/CONTEXT.md](../ecommerce/CONTEXT.md)) or, in a single-context repo, a root `CONTEXT.md`.

3. **`docs/adr/`** — workspace-wide ADRs that touch the area you're about to work in.

4. **`docs/<area>/adr/`** — optional context-scoped ADRs when the map or folder layout includes them (same numbering rules per area; see [ADR-FORMAT.md](../../.cursor/skills/domain-modeling-overlay/ADR-FORMAT.md)).

If any of these files or folders don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/domain-modeling-overlay`) creates them lazily when terms or decisions actually get resolved.

## File structure (aligned with CONTEXT-FORMAT)

**Single context (most repos):** one glossary at the repo root.

```

/

├── CONTEXT.md

├── docs/

│   └── adr/

└── src/

```

**This Nx monorepo:** map at root; glossaries under **`docs/<area>/CONTEXT.md`** next to area docs (schema, APIs). System-wide engineering guides stay as **`docs/*.md`** at the top of `docs/`, not inside `docs/<area>/`, unless scoped to one product — see [CONTEXT-MAP.md](../../CONTEXT-MAP.md).

```

/

├── CONTEXT-MAP.md

├── docs/

│   ├── adr/

│   ├── front-end-infrastructure.md ← workspace engineering (not a CONTEXT)

│   ├── nestjs-architecture.md

│   └── ecommerce/

│       ├── CONTEXT.md

│       ├── db-structure.md

│       └── adr/                      ← optional, e-commerce–scoped ADRs

├── apps/

└── libs/

```

## CONTEXT.md conventions (when you read a glossary)

Match how authors are expected to write glossaries per CONTEXT-FORMAT:

| Section | What it means for you |

| ------- | --------------------- |

| **Title + short intro** | Context name and why that bounded area exists. |

| **Language** | Canonical terms: typically **Bold term** followed by a tight definition (what it **is**, not what it does). **_Avoid_** lists synonyms **not** to use in prose or code names — honor them. |

| **Relationships** | How bold-named concepts connect; cardinality where stated. |

| **Example dialogue** | Dev vs domain expert — use this to disambiguate edge cases. |

| **Flagged ambiguities** | Resolved naming conflicts; don't reintroduce dropped synonyms. |

**Rules mirrored from CONTEXT-FORMAT:** Prefer the glossary's chosen word over avoided aliases. Only **domain** concepts belong there — general programming terms are out of scope even if the project uses them heavily. If terms are grouped under subheadings, keep that mental model when reasoning about the domain.

## Use the glossary's vocabulary

When your output names a domain concept (issue title, refactor proposal, hypothesis, test name), use the term as defined in the active `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling-overlay`).

## Angular cross-domain writes (ecommerce-style)

When one **`domains/<bounded-context>/`** slice must **change state owned by another** (for example **Catalog** updating **Cart**), use **NgRx Signal Store [Events](https://ngrx.io/guide/signals/signal-store/events)** and **`anti-corruption-layer.ts`** as in **`docs/front-end-infrastructure.md`**: the **owning** context defines and re-exports **events** for dispatch; **consumers** dispatch those events only—they do not call the owner’s internal **`signalStore`** API for those writes.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
