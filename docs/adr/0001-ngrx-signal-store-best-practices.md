---
status: accepted
---

# NgRx Signal Store — workspace conventions and best practices

We adopt **[@ngrx/signals](https://ngrx.io/guide/signals/signal-store) `signalStore`** as the primary pattern for feature- and domain-scoped client state in Angular apps in this workspace, and we align store design with the official Signal Store documentation. This ADR records *how* we use it so stores stay consistent, testable, and compatible with our DDD-oriented front-end layout (see [docs/front-end-infrastructure.md](../front-end-infrastructure.md)).

## Context

Signal Store composes reactive state from **`withState`**, derived values from **`withComputed`**, dependencies from **`withProps`**, and behavior from **`withMethods`**, with optional reusable **`signalStoreFeature`** slices. It integrates with Angular signals and, via **`@ngrx/signals/rxjs-interop`**, with RxJS for async flows. The [Learn SignalStore](https://ngrx.io/guide/signals/signal-store) material is the canonical reference for API shape and intended usage.

## Decision

All new feature-scoped state that fits “owned by one bounded context / feature” should be modeled with **`signalStore`** unless a simpler **`signal`/`computed`** local to a component is clearly enough. Global NgRx Store (actions/reducers) is out of scope for this ADR; prefer Signal Store for colocated, injectable state that maps cleanly to our **`application/`** layer.

---

## Best practices (aligned with the Signal Store guide)

### 1. Model state explicitly with `withState`

- Declare a **single typed initial state object** (and export its type when other layers need it).
- **Every property you intend to update with `patchState` must exist on that initial object.** The runtime warns if you patch unknown keys; missing keys are ignored, which is a common source of “state didn’t update” bugs.
- Prefer **serializable, plain data** in state (entities, IDs, value objects). Keep side-effecting services out of `withState`; put them in **`withProps`**.

### 2. Derive read models with `withComputed`

- Use **`withComputed`** for anything that can be expressed as a pure function of state (and other signals), rather than storing redundant fields.
- Keep computeds **small and named** so templates and tests can depend on stable signal names.

### 3. Encapsulate behavior in `withMethods`

- **Public mutations** go through methods on the store, not ad-hoc `patchState` from components.
- Methods should be **intention-revealing** (`setPage`, `load`, `clearError`) rather than generic setters when that helps preserve invariants.

### 4. Inject collaborators with `withProps` and `inject()`

- Use **`withProps(() => ({ ... }))`** with Angular’s **`inject()`** for **`HttpClient` wrappers, facades, other tokens, and optional `Injector`** when needed.
- Do **not** put raw HTTP calls in components if the store already owns the use case; the store orchestrates, infrastructure services perform I/O (per [front-end-infrastructure.md](../front-end-infrastructure.md)).

### 5. Update immutably with `patchState`

- Prefer **`patchState(store, partial)`** (and multiple partial objects where the API allows) for updates.
- **`patchState`** accepts **updater functions** when you need the previous value (`(state) => ({ ... })`).
- Batch related writes in **one** `patchState` where possible to avoid redundant signal notifications.

### 6. Compose reusable behavior with `signalStoreFeature`

- Extract cross-cutting store capabilities (loading/error helpers, pagination, entity helpers) into **`signalStoreFeature(...)`** so multiple stores share the same pattern without copy-paste.
- Features must **compose in a sensible order**: state before computeds that read it; props before methods that use them. Follow the ordering examples from the official guide when stacking features.

### 7. Async and RxJS: `rxMethod` and operators

- For observable-driven workflows, use **`rxMethod`** from **`@ngrx/signals/rxjs-interop`** so subscription lifecycle stays tied to the store’s injection context (see [RxJS integration](https://ngrx.io/guide/signals/rxjs-integration)).
- Prefer **`tapResponse`** from **`@ngrx/operators`** (or equivalent) inside pipes to **branch success/error**, then **`patchState`** once per outcome—avoid duplicating subscribe blocks for loading flags.
- If you use **`rxMethod` outside** a constructor or field initializer, pass an **`Injector`** explicitly when required by the API; heed the library’s warnings about injection context and leaks.

### 8. Lifecycle with `withHooks`

- Use **`withHooks`** for **onInit**/**onDestroy** logic that belongs with the store (for example wiring external subscriptions or logging), keeping components thin.

### 9. Encapsulation: `protectedState` when appropriate

- Use the store configuration’s **`protectedState`** option when you want **write access narrowed** to store methods while still exposing read-only state to consumers, matching the encapsulation patterns described in the Signal Store documentation.

### 10. Events for cross-boundary commands

- When another bounded context must **trigger** work without owning the state, use **[@ngrx/signals/events](https://ngrx.io/guide/signals/events)** with **`withReducer` / `on(...)`** in the owning store, and surface dispatch only through the **anti-corruption layer** as described in [front-end-infrastructure.md](../front-end-infrastructure.md). Do not inject another domain’s store type from foreign code.

### 11. Testing and providers

- Provide the store (or a test double) with **`TestBed`** / **`provideMockStore`** patterns appropriate to Signal Store; keep **initial state** and **mocks for `withProps` dependencies** explicit so tests don’t rely on implicit root injectables.

### 12. Naming and placement in this repo

- Name stores **`*.store.ts`** and keep them under the owning context’s **`application/`** (or **`core/<domain>/application/`** when promoted), consistent with [front-end-infrastructure.md](../front-end-infrastructure.md).
- Map wire/DTO shapes to domain shapes in **small mappers** next to the store **before** or **as** state is written, so the store’s public read model speaks domain language.

---

## Consequences

- Onboarding and code review can reference this ADR plus the official [Signal Store guide](https://ngrx.io/guide/signals/signal-store) instead of re-deriving conventions per PR.
- Deviations (for example a one-off `writableSignal` in a leaf component) should be **local and obviously scoped**; repeated patterns belong in a **`signalStore`** or shared **`signalStoreFeature`**.

## References

- [NgRx — Learn SignalStore](https://ngrx.io/guide/signals/signal-store)
- [NgRx — RxJS integration (reactive methods)](https://ngrx.io/guide/signals/rxjs-integration)
- [NgRx — Signals events](https://ngrx.io/guide/signals/events)
- [Workspace front-end infrastructure and ACL](../front-end-infrastructure.md)
