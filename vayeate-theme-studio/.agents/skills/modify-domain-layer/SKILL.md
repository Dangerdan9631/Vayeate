---
name: modify-domain-layer
description: Domain layer organization, structure patterns for operations, validations, state, utils, and core modules. Use when authoring, modifying, or interacting with domain types
---

# Layer: domain

## Top-level domain structure

- `src/domain/` is organized by architectural role first, then domain: `operations/`, `validations/`, `state/`, `utils/`, and `core/`, each divided into `Common/`, `Catalog/`, `Template/`, and `Theme/`. Use paths such as `src/domain/operations/Catalog/catalog/`, `src/domain/validations/Catalog/catalog/`, and `src/domain/state/Catalog/catalog/`. Do not add new domain-first folders such as `src/domain/<business-domain>/operations/`. App-facing controller orchestration lives under `src/app/controllers/**`.
- Controllers under `src/app/controllers/**` run validations then operations only (**must not** invoke other controllers); **never** set store state directly

  **Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When you change controller class/file naming here, update that `describe` and vice versa.**

- `operations/` — **only** place for business logic, gateways/services, and **store writes**. Queue observability writes are still operations, but their queue-status controllers may be called directly from the action/background queue implementations — see [app-architecture.mdc](app-architecture.mdc).
- **Exception — queue adapters:** `EnqueueActionQueueOperation` and `EnqueueBackgroundQueueActionOperation` are infrastructure adapter operations that bridge domain callers to app-core queues and may import the required app queue types/classes. Do not treat this as precedent for ordinary domain operations importing `src/app/**`.
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
