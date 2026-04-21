---
name: create-state
description: Adds or changes domain zustand stores in Vayeate Theme Studio. Use when introducing new app state shape, store methods, or store wiring.
---

# Create / modify State

## Authority

[`.cursor/rules/state.mdc`](../../rules/state.mdc), [`.cursor/rules/layer-domain.mdc`](../../rules/layer-domain.mdc).

## Workflow

1. Place state modules under the owning domain: `vayeate-theme-studio/src/domain/state/**/` for shared legacy state, `src/domain/<business-domain>/state/**/` for business-domain state, or `src/domain/ui/**/state/**/` for UI-domain state.
2. Pair each new `*-store.ts` class with a sibling `*-state.ts` module that holds the state interface, initial values, and related helper types.
3. Create a `@singleton()` `*-store.ts` class built with `createStore(...)` and `immer(...)`.
4. Expose one data root such as `state` or `config`, store-owned mutation methods, an `api` getter, and `getStore()`.
5. Keep writes inside store methods that operations call through `this.someStore.getStore().setX(...)`.
6. Colocate pure selector/helper functions in the `*-store.ts` file when they operate on that store's state and need no React or mutation.

## Checklist

- [ ] No React imports in state modules
- [ ] Store file uses `zustand/vanilla` + `zustand/middleware/immer`
- [ ] React Components never call store mutation methods directly
- [ ] Controllers/validations read snapshots; operations write through store methods
- [ ] Store exposes `api` and `getStore()`
- [ ] Store-file helper exports are pure selectors/helpers only
