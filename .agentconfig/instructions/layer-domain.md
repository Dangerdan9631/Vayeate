---
activation: ai-decided
description: Use when authoring, modifing, or interacting with Domain types - operations, validations, state, utils
---

# Layer: domain

## Top-level domain structure

- `src/domain/` is organized by domain first. Business-domain folders such as `catalog/` own business state and validations. UI-domain folders under `ui/<flow>/` own renderer-facing UI state and operations. Each domain may contain its own `operations/`, `validations/`, `state/`, and helpers. Legacy shared concept folders such as `operations/`, `validations/`, `state/`, `utils/`, and `core/` remain valid for shared or not-yet-migrated concerns. App-facing controller orchestration lives under `src/app/**/controllers/`.
- Controllers under `src/app/**/controllers/` run validations then operations only (**must not** invoke other controllers); **never** set store state directly

  **Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When you change controller class/file naming here, update that `describe` and vice versa.**

- `operations/` — **only** place for business logic, gateways/services, and **store writes** (**exception:** queue-status slice updates invoked **only** from `ActionQueue` in app core — see [app-architecture.mdc](app-architecture.mdc))
- `validations/` — `Validate*` classes with `test(...)` returning either `boolean` for simple predicates or `ValidationResult` for UI/error-message workflows. Use `Validator<T>` to compose multiple message-bearing validations.
- `state/` — zustand store classes plus state shape/helpers
- `utils/` — pure helpers (no state mutation)
- `core/` — shared domain-layer primitives and infrastructure helpers that support multiple domain concepts without introducing renderer or Electron business logic

## Invariants

- Controllers and validations **read** store snapshots; **operations** apply updates via store methods.
- No domain business rules in `electron/` or raw React components.

## Good / bad

```ts
// BAD — controller patches state
this.catalogsStore.getStore().setCatalog(next);

// GOOD — controller calls operation that uses store method
this.saveCatalogOp.execute({ id, data });
```
