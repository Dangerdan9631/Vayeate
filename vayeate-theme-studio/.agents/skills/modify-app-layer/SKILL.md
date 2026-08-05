---
name: modify-app-layer
description: App layer structure, organization patterns for actions, handlers, components, and viewmodels. Use when authoring, modifying, or interacting with UI types
---

# Layer: app

## Structure

- `src/app/actions/<Domain>/<feature>/` — action types + **handlers**, where `<Domain>` is `Common`, `Catalog`, `Template`, `Theme`, `Queue`, or `Undo`. `*-action-type.ts` modules may export action unions plus **is*Action** guard functions; use separate `*-action-guard.ts` files only if that split is introduced and tested. Feature action unions may include local action unions, feature guards may delegate to local guards, and feature handlers may delegate to local handlers after an action guard. Leaf handlers route to controllers only.

  **Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When handler module naming or export shape changes here, update `*-handler.ts: one exported class…` and vice versa.** Tests also forbid imports from `domain/operations`, `domain/validations`, and `domain/state` in `src/app/actions/**/*-handler.ts`; require at least one exported `is*Action` guard function in `src/app/actions/**/*-action-type.ts`; and forbid `domain/state` imports in `src/app/actions/**/*-action-type.ts` (payload hygiene).

- `src/app/components/<Domain>/<feature>/` — React UI; **PascalCase** `*.tsx` filenames per [component.mdc](component.mdc). Components do not own sibling `actions/`, `controllers/`, or `viewmodel/` folders; keep those files in their role/domain buckets.
- `src/app/controllers/<Domain>/<feature>/` — app-facing orchestration entrypoints; run validations then operations only, and do not call other controllers.
- `src/app/viewmodel/<Domain>/<feature>/` — exposes store state via `useStore(store.api, selector)`, derived presentation/business guards, error/message state, and named action callbacks; uses validations for guards when aligned with controller or shared validation.
- `src/app/core/<Domain>/` — app infrastructure such as action queues, background queues, bootstrap, and undo shell adapters; current shared infrastructure belongs under `src/app/core/Common/`.

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
