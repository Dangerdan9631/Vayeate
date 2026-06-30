---
name: modify-app-layer
description: App layer structure, organization patterns for actions, handlers, components, and viewmodels. Use when authoring, modifying, or interacting with UI types
---

# Layer: app

## Structure per domain

- Feature-root `actions/` — action types + **handlers** for broad UI-domain actions. `*-action-type.ts` modules may export action unions plus **is*Action** guard functions; use separate `*-action-guard.ts` files only if that split is introduced and tested. Feature action unions may include local action unions, feature guards may delegate to local guards, and feature handlers may delegate to local handlers after an action guard. Leaf handlers route to controllers only.

  **Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When handler module naming or export shape changes here, update `*-handler.ts: one exported class…` and vice versa.** Tests also forbid imports from `domain/operations`, `domain/validations`, and `domain/state` in `actions/*-handler.ts`; require at least one exported `is*Action` guard function in `actions/*-action-type.ts`; and forbid `domain/state` imports in `actions/*-action-type.ts` (payload hygiene).

- `components/` or direct feature folders such as `src/app/<domain>/<feature-or-component>/` — React UI; **PascalCase** `*.tsx` filenames per [component.mdc](component.mdc). Self-contained UI flows may colocate `actions/`, `controllers/`, and `use-*-viewmodel.ts` under the direct feature folder or under `components/<component>/`; match the surrounding domain.
- `controllers/` — app-facing orchestration entrypoints; run validations then operations only, and do not call other controllers. Feature/component-owned controllers may live under `src/app/<domain>/<feature-or-component>/controllers/` or `components/**/controllers/`.
- `viewmodel/`, direct feature `src/app/<domain>/<feature-or-component>/use-*-viewmodel.ts`, or colocated `components/**/use-*-viewmodel.ts` — exposes store state via `useStore(store.api, selector)`, derived presentation/business guards, error/message state, and named action callbacks; uses validations for guards when aligned with controller or shared validation.

  **Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When viewmodel file/hook naming changes here or in [viewmodel.mdc](viewmodel.mdc), update that `describe` and vice versa.**

## Actions

- Naming: `<CONTROL>_<ACTION>` (e.g. `THEME_DETAILS_SAVE_BUTTON_ON_CLICK`).
- **One** action per **user or lifecycle** interaction (clicks, inputs, **mount load**, **unmount/cleanup unload**, etc.); only UI-derived or identity fields in payload (not state-derived).
- **Handlers**: contain no business logic. Feature handlers may delegate to local handlers after an action guard, and leaf handlers route to controllers only.

## Good / bad

```ts
// BAD — handler mutates or implements rules
case X: setState(...); break;

// GOOD
case X:
  await container.resolve(FooController).run(action);
  break;
```
