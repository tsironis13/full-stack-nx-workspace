---
status: accepted
date: 2026-09-06
---

# Cart Item workflow refuses out-of-stock writes and commits via CartStore

In-chat conversion of a last-turn **Product recommendation** into a **Cart Item** is a **Cart Item workflow**, not an expansion of **Shopping Assistant** retrieval. We decided the workflow **never writes an Out of Stock Product Item** (disable that combination; stop if every **Product Item** is out of stock) and that **confirm commits through the storefront Cart path** (`CartStore`: guest localStorage, registered server). We did **not** have the workflow `POST /cart`, and we did **not** reopen guest server carts ([0004](./0004-cart-persistence-split-guest-localstorage-registered-server.md)). Chat is therefore **stricter than product-detail add**: `AddCartItemUseCase` still does not check **Inventory**. Putting unsellable units in the **Cart** from a guided flow is a worse failure than a silent grid add; inventing a second cart-write path would desync **Guest Users** from ADR 0004.

## Considered Options

- **Refuse OOS in the workflow only; CartStore write (chosen)** — Honest stock on the confirm surface; one **Cart** implementation; guests stay in the same discovery→add path as **Shopping Assistant**.
- **Same as today’s API** — Allow OOS adds from chat; shopper discovers the problem later; v1 **Checkout** does not reject zero stock either.
- **Registered-only in-chat add / workflow `POST /cart`** — Sign-in wall at intent; second write path; guests can recommend but cannot convert.
- **Server-side guest carts** — Reopens ADR 0004 for one workflow.

## Consequences

- Product detail and the cart API may still add **Out of Stock Product Items** until a separate inventory-enforcing cart decision.
- Confirm must cap quantity at **Inventory** and show **Sale Price** on the resolved **Product Item**, not the recommendation card’s **Main Product Item** price.
- The workflow resolves a **Product Item**; it does not own **Cart** persistence.
