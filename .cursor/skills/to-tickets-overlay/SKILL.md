---
name: to-tickets-overlay
description: Workspace overlay for to-tickets — break a plan or spec into tracer-bullet tickets on the issue tracker. Use when user wants to convert a plan into issues, create implementation tickets, or break down work into issues.
---

Workspace overlay for the base `to-tickets` skill.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-skills` if not.

## Base skill (required first)

Read and follow `~/.agents/skills/to-tickets/SKILL.md` end-to-end (gather context → explore → draft vertical slices with blocking edges → quiz the user → publish with its templates → work the frontier).

Do **not** invent a second template or publish path. Apply the overlay below while running that process. This workspace uses the configured GitHub issue tracker (`docs/agents/issue-tracker.md`).

## Process overlay

While following the base `to-tickets` process, specialize these steps for this workspace:

### Draft vertical slices — HITL / AFK

In addition to the base vertical-slice rules, classify each ticket as **HITL** or **AFK**:

- **HITL** — requires human interaction (architectural decision, design review, etc.)
- **AFK** — can be implemented and merged without human interaction

Prefer AFK over HITL where possible.

### Cross-domain communication (Angular / NgRx)

When a slice touches **more than one** bounded context under **`domains/<name>/`** (for example **Catalog** driving **Cart** mutations), describe integration in the ticket using this workspace’s rule:

- **Writes** from the consumer domain to the owner domain go **only** through **NgRx Signal Store [Events](https://ngrx.io/guide/signals/signal-store/events)**: the **owning** context defines **`event(...)`** payloads, handles them with **`withReducer(on(...))`**, and **re-exports** dispatchable events from **`anti-corruption-layer.ts`**. Consumer domains **dispatch** those events and **must not** call the owner’s **`signalStore`** methods or import store types.
- **Reads** exposed to outsiders use the **ACL**’s narrow adapters / signals (`docs/front-end-infrastructure.md` — Anti-corruption layer).

Call this out in **What to build** / **Acceptance criteria** when relevant so agents do not “reach through” with ad-hoc façade calls.

### Quiz the user (extra checks)

When presenting the breakdown (base skill step 4), also show for each ticket:

- **Type**: HITL / AFK
- **User stories covered**: which user stories this addresses (if the source material has them)

Also ask:

- Are the correct tickets marked as HITL and AFK?

### Publish

Follow the base skill’s publish steps for a real issue tracker. Apply the `ready-for-agent` triage label unless instructed otherwise (AFK tickets are agent-grabbable by construction; HITL tickets may need a different label if the user says so).
