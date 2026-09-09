---
status: accepted
---

# In-house presentational kit in `shared` (replace PrimeNG on ecommerce)

The storefront mixes Tailwind with PrimeNG (Aura) for buttons, fields, the Cart drawer, paginator, spinner, cards, and inline messages. We replace that PrimeNG surface with dump primitives in the existing `shared` library so ecommerce can drop PrimeNG without a visual rebrand, without a new Nx project, and without adopting another component kit.

## Decision

- **Home:** a `ui-kit` folder inside `shared`, consumed only through `lib-api`. Not a new Nx library. `business-portal` stays off this stack in v1.
- **Not Spartan / shadcn / DaisyUI:** those bring a second design-system opinion and more primitives than we need to delete PrimeNG. The v1 kit is the smallest set of dump widgets that covers current storefront callers.
- **Not Angular CDK in v1:** the only overlay is the Cart drawer. A native `<dialog>` (modal) is enough; revisit CDK when a primitive needs a floating layer (custom listbox, tooltip).
- **PrimeIcons stay** as a font. Icons are projected content, not an `icon` input. Replacing the icon pack is out of scope.
- **Dump primitives vs app UI:** kit members have no domain knowledge (ADR 0002). Storefront-only dump UI stays app `ui-api`. Cart quantity control and price-range widgets remain siblings in `shared`, not kit members. Cross-domain Cart writes stay ACL + NgRx Signal Store events; the kit adds none.
- **No extra primitives until a caller exists:** no Dialog, Tabs, Tooltip, Toast, Fluid, or custom Select listbox in v1.

## Considered options

| Option | Why not |
| --- | --- |
| Keep PrimeNG | Couples the storefront to PrimeNG’s API and Aura; blocks a coherent Tailwind look and sharing with a later app. |
| Spartan / shadcn / DaisyUI | Extra kit + primitives we do not have callers for; still a third-party API to learn. |
| New Nx `ui-kit` library | One Angular app on this stack today; a folder in `shared` already has `lib-api` and boundary rules. |
| Angular CDK overlays | Unnecessary for a single native-dialog drawer. |
