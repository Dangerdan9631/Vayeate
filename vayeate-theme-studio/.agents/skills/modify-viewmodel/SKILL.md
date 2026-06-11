---
name: modify-viewmodel
description: ViewModel contract, store subscriptions via hooks, action callbacks, and state exposure patterns. Use when authoring, modifying, or interacting with react component viewmodels
---

# ViewModel

## Contract

**Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When viewmodel hook/file naming changes here, update `use-*-viewmodel.ts: at least one exported function…` and vice versa.** Components should keep subscriptions inside viewmodels rather than inline in `*.tsx`.

- Expose selected store values via **`useStore(store.api, selector)`**, derived presentation/business guards, error/message state, and named action callbacks.
- Viewmodels may use `useAppDispatch()` to enqueue UI actions.
- **Exception:** the app-shell lifecycle viewmodel may directly invoke load/unload controllers during mount/cleanup, matching [app-architecture.mdc](app-architecture.mdc); ordinary viewmodels dispatch actions.
- **Components must not** define raw store subscriptions inline; they consume viewmodel hooks only.
- Use **validations** for guards shared with controllers or domain validation; keep simple view-only derived state in the viewmodel.

## Anti-patterns

- Store mutation, gateways/services, system I/O, or reusable domain algorithms (belongs in **operations** / **gateways**).
- Direct state mutation.

## Good / bad

```tsx
// BAD — in component file
const x = useStore(catalogsStore.api, (store) => store.state.catalog);

// GOOD — in viewmodel hook
export function useCatalogVm() {
  return useStore(catalogsStore.api, (store) => store.state.catalog);
}
```
