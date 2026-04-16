---
name: create-state
description: Adds or changes domain zustand stores in Vayeate Theme Studio. Use when introducing new app state shape, store methods, or store wiring.
---

# Create / modify State

## Authority

[`.cursor/rules/state.mdc`](../../rules/state.mdc), [`.cursor/rules/layer-domain.mdc`](../../rules/layer-domain.mdc).

## Workflow

1. Place state shape helpers and the store class under `vayeate-theme-studio/src/domain/state/<domain>/`.
2. Create a `@singleton()` `*-store.ts` class built with `createStore(...)` and `immer(...)`.
3. Expose one data root such as `state` or `config`, store-owned mutation methods, an `api` getter, and `getStore()`.
4. Keep writes inside store methods that operations call through `this.someStore.getStore().setX(...)`.
5. **Exception:** queue-status wiring is owned by `ActionQueue` / background queue implementations (see [app-architecture.mdc](../../rules/app-architecture.mdc)); do not route those updates through ordinary domain operations.

## Checklist

- [ ] No React imports in state modules
- [ ] Store file uses `zustand/vanilla` + `zustand/middleware/immer`
- [ ] Components never call store mutation methods directly
- [ ] Controllers/validations read snapshots; operations write through store methods
- [ ] Store exposes `api` and `getStore()`
- [ ] If adding queue-status fields, only `ActionQueue` or the queue implementation updates them
