---
name: create-component
description: Adds or changes a React component in Vayeate Theme Studio app layer. Use for UI work that dispatches actions and reads state via viewmodels.
---

# Create / modify Component

## Authority

[`.cursor/rules/component.mdc`](../../rules/component.mdc), [`.cursor/rules/layer-app.mdc`](../../rules/layer-app.mdc).

## Workflow

1. Place in `vayeate-theme-studio/src/app/<domain>/components/` (or pages subtree).
2. **PascalCase** component and **PascalCase** filename matching the default export (e.g. `ThemeDetailsCard.tsx`).
3. For each event, define a **named UI handler** (e.g. `function onControlAction() { … }`) that extracts DOM values or handles UI concerns, then calls a named callback returned by the viewmodel. The viewmodel builds and dispatches the action. Pass handlers by name on the element (`onClick={onControlAction}`); do not pass inline arrow functions directly to event props. For **mount/unmount**, use the same pattern (e.g. `useEffect` with stable viewmodel callback + optional cleanup) so **load/unload** dispatch **one** named action each — not a shortcut around the queue.
4. Use **viewmodel** hooks for state; never resolve controllers/operations in the component.

## Checklist

- [ ] **PascalCase** filename matches default export (see [component.mdc](../../rules/component.mdc))
- [ ] Action type follows `<CONTROL>_<ACTION>`; payload not state-derived
- [ ] Event props reference named handler functions only — no inline arrows on JSX elements
- [ ] Lifecycle load/unload (if any) call viewmodel callbacks like other UI events — no direct controller/operation calls
- [ ] No `useAppDispatch()` in ordinary component files; dispatch callbacks come from the viewmodel
- [ ] No business logic; no direct store writes or subscriptions
