---
name: create-viewmodel
description: Adds or changes an app ViewModel hook in Vayeate Theme Studio. Use when exposing app state to React or aligning UI guards with validations.
---

# Create / modify ViewModel

## Authority

[`.cursor/rules/viewmodel.mdc`](../../rules/viewmodel.mdc), [`.cursor/rules/layer-app.mdc`](../../rules/layer-app.mdc).

## Workflow

1. Place under `vayeate-theme-studio/src/app/<domain>/viewmodel/` (or `common` / `core` as appropriate).
2. Export hooks that wrap **`useStore(store.api, selector)`** for needed slices only.
3. Import **validations** for disabled/visible logic; do **not** call operations/controllers from hooks.
4. Keep one primary hook module per concern; kebab-case file name.

## Skeleton

```ts
import { useStore } from 'zustand';
import { CatalogsStore } from '...';

export function useExampleVm() {
  return useStore(catalogsStore.api, (store) => store.state.exampleSlice);
}
```

## Checklist

- [ ] No store subscriptions defined inline in `.tsx` components
- [ ] No IPC or domain mutations
