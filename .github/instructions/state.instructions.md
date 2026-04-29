---
applyTo: "**/*"
---

> **Apply only when:** Use when authoring, modifing, or interacting with zustand stores

# State

## Store shape

- State lives in domain-owned **zustand vanilla stores** under `src/domain/**/state/**`, including shared legacy state under `src/domain/state/**`, business-domain state under `src/domain/<business-domain>/state/**`, and UI-domain state under `src/domain/ui/**/state/**`.
- Use `createStore(...)` with **`immer(...)`** middleware.
- Each store exposes:
  - One data root such as `state` or `config`
  - Store-owned mutation methods like `setSelectedRef`, `setConfig`, `setMenuOpenState`
  - `api` getter for React subscriptions
  - `getStore()` returning the current store snapshot plus mutation methods

## Access

| Consumer | Read | Write |
|----------|------|-------|
| Controllers / validations | `this.someStore.getStore().state` (or sibling data root like `config`) | Never |
| Operations | `this.someStore.getStore().state` (or sibling data root like `config`) | `this.someStore.getStore().setX(...)` |
| React | Via viewmodel hooks + `useStore(store.api, selector)` | Never |

## Rules

- Stores are **domain-owned** and should stay free of React imports.
- A `*-store.ts` may export pure helper/selectors colocated with the store when they operate on that store's state shape and do not mutate state or import React.
- Keep mutation methods on the store class; components never import or call store mutation methods directly.
- Controllers and validations may read store snapshots, but only operations mutate domain state.
- Prefer narrow store methods over ad-hoc whole-object replacement unless a full snapshot reset is the intended behavior.
- **Do not** update queue-status or queue-observability store state from components, handlers, controllers, or normal operations — only from the queue implementation.

## Good / bad

```ts
// BAD — component subscribes directly and mutates state
const catalog = catalogsStore.getStore().state.catalog;
catalogsStore.getStore().setCatalog(next);

// GOOD — viewmodel + operation boundaries
const catalog = useStore(catalogsStore.api, (store) => store.state.catalog);
this.catalogsStore.getStore().setCatalog(nextCatalog);
```