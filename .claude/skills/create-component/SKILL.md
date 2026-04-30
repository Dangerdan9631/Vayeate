---
name: create-component
description: Adds or changes a React component in Vayeate Theme Studio app layer. Use for UI work that dispatches actions and reads state via viewmodels.
---

# Create / modify Component

## Authority

[`.cursor/rules/component.mdc`](../../rules/component.mdc), [`.cursor/rules/layer-app.mdc`](../../rules/layer-app.mdc).

## Workflow

1. Place in a feature-owned app folder under `vayeate-theme-studio/src/app/**`, following the existing structure. Components may live in `components/` subtrees or be colocated directly in folders such as `app-shell/`, `create-dialog/`, `menu-bar/`, or other feature-owned directories.
2. **PascalCase** component and **PascalCase** filename matching the default export (e.g. `ThemeDetailsCard.tsx`).
3. For each event, define a **named function** (e.g. `function onControlAction() { … }`) and pass it by name on the element (`onClick={onControlAction}`). Do not pass inline arrow functions directly to event props. Build **one** action object and enqueue (ActionQueue / dispatcher pattern in project). For **mount/unmount**, use the same pattern (e.g. `useEffect` with stable enqueue + optional cleanup) so **load/unload** dispatch **one** named action each — not a shortcut around the queue.
4. Use **viewmodel** hooks for state; never resolve controllers/operations in the component.

## Checklist

- [ ] **PascalCase** filename matches default export (see [component.mdc](../../rules/component.mdc))
- [ ] Action type follows `<CONTROL>_<ACTION>`; payload not state-derived
- [ ] Event props reference named handler functions only — no inline arrows on JSX elements
- [ ] Lifecycle load/unload (if any) enqueue actions like other UI events — no direct controller/operation calls
- [ ] No business logic; no direct store writes or subscriptions
