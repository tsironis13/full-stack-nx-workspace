---
status: accepted
date: 2026-09-06
---

# Cart Item workflow is a Mastra workflow started by Shopping Assistant, not a sub-agent

**Shopping Assistant** (`shoppingAgent`) stays a retrieval **Agent**. **Cart Item workflow** is a Mastra **workflow** that agent may **start as a tool** (a card action may start the same run). Option pickers and confirm are A2UI surfaces **returned from workflow steps/tool results** — this repo already forwards `{ surfaceId, messages }` as `a2ui-surface` without the model authoring operations. We did **not** add a sub-agent under `shoppingAgent`, and we did **not** attach generic A2UI-authoring instructions to the main agent for this job. A second LLM would pick a **Product Item**; A2UI instructions on the retriever would draw mutation UI in the agent we forbade from mutating. `shoppingAgent` may only learn *when* to start (last-turn **Product** id + option hints, never a **Product Item** id). Client catalog registration so those surfaces render is not agent instructions. Migrating **Product recommendation** cards from CopilotKit widgets to A2UI is a separate decision.

## Considered Options

- **Workflow as a tool of `shoppingAgent`; A2UI from step results (chosen)**
- **Sub-agent of `shoppingAgent`** — second persona, model can invent a **Product Item** id
- **Generic A2UI instructions on `shoppingAgent`** — no workflow; the retriever authors pickers/confirm

## Consequences

- Register the workflow on the `ai-server` Mastra instance; do not register a second cart agent as the shopper-facing persona.
- Confirm still commits via **CartStore** ([0006](./0006-cart-item-workflow-stock-and-cartstore.md)).
