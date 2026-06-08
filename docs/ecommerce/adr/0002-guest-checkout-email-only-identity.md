# Guest checkout uses email-only identity (no account creation)

When a Guest User places an Order, we store only their email address as identity — no Customer Account is created and no deferred "claim your order" flow is offered in v1. We chose this over forcing registration mid-flow (Option B) or prompting account creation post-confirmation (Option C) because both alternatives require auth mutation during or immediately after checkout, which adds complexity without a clear product need at this stage. Guest Orders are stored with `guest_email` populated and `user_id` null. Account linking can be introduced later without restructuring the Order schema.

## Considered Options

- **Email-only (chosen)** — minimal identity, no account state mutated at checkout time.
- **Force registration** — simpler order ownership model but degrades conversion for guests.
- **Deferred account creation** — better long-term UX but requires a post-order auth flow; deferred.
