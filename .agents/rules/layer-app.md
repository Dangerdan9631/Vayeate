---
activation: model
description: Use when authoring, modifing, or interacting with Ui types - actions, handlers, components, viewmodels
---

# Layer: app

## Structure per domain

- Feature-root `actions/` — action types + **handlers** for broad UI-domain actions. Feature action unions may include component action unions, feature guards may delegate to component guards, and feature handlers may delegate to component-local handlers after an action guard. Leaf handlers route to controllers only.

  **Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When handler module naming or export shape changes here, update `*-handler.ts: one exported class…` and vice versa.** Tests also forbid imports from `domain/operations`, `domain/validations`, and `domain/state` in `actions/*-handler.ts`; require **one exported function** in `actions/*-action-guard.ts`; and forbid `domain/state` imports in `actions/*-action-type.ts` (payload hygiene).

- `components/` — React UI; **PascalCase** `*.tsx` filenames per [component.mdc](component.mdc). Self-contained component flows may colocate `actions/`, `controllers/`, and `use-*-viewmodel.ts` under `components/<component>/`.
- `controllers/` — app-facing orchestration entrypoints; run validations then operations only, and do not call other controllers. Component-owned controllers may live under `components/**/controllers/`.
- `viewmodel/` or colocated `components/**/use-*-viewmodel.ts` — exposes store state via `useStore(store.api, selector)`, derived presentation state, and named action callbacks; uses validations for guards.

  **Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When viewmodel file/hook naming changes here or in [viewmodel.mdc](viewmodel.mdc), update that `describe` and vice versa.**

## Actions

- Naming: `<CONTROL>_<ACTION>` (e.g. `THEME_DETAILS_SAVE_BUTTON_ON_CLICK`).
- **One** action per **user or lifecycle** interaction (clicks, inputs, **mount load**, **unmount/cleanup unload**, etc.); only UI-derived or identity fields in payload (not state-derived).
- **Handlers**: contain no business logic. Feature handlers may delegate to component-local handlers after an action guard, and leaf handlers route to controllers only.

## Good / bad

```ts
// BAD — handler mutates or implements rules
case X: setState(...); break;

// GOOD
case X:
  await container.resolve(FooController).run(action);
  break;
```