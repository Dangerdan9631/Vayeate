---
name: create-viewmodel
description: Adds or changes an app ViewModel hook in Vayeate Theme Studio. Use when exposing app state to React or aligning UI guards with validations.
---

# Create / modify ViewModel

## Authority

[`.cursor/rules/viewmodel.mdc`](../../rules/viewmodel.mdc), [`.cursor/rules/layer-app.mdc`](../../rules/layer-app.mdc).

## Workflow

1. Place under `vayeate-theme-studio/src/app/<domain>/viewmodel/` (or `common` / `core` as appropriate).
2. Export hooks that wrap **`useContextSelector`** for needed slices only.
3. Import **validations** for disabled/visible logic; do **not** call operations/controllers from hooks.
4. Keep one primary hook module per concern; kebab-case file name.

## Skeleton

```ts
import { useContextSelector } from 'use-context-selector';
import { AppStateContext } from '...';

export function useExampleVm() {
  return useContextSelector(AppStateContext, (s) => s.example.slice);
}
```

## Checklist

- [ ] No selectors defined inline in `.tsx` components for app state
- [ ] No IPC or domain mutations
