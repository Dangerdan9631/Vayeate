---
name: create-component
description: Adds or changes a React component in Vayeate Theme Studio app layer. Use for UI work that dispatches actions and reads state via viewmodels.
---

# Create / modify Component

## Authority

[`.cursor/rules/component.mdc`](../../rules/component.mdc), [`.cursor/rules/layer-app.mdc`](../../rules/layer-app.mdc).

## Workflow

1. Place in `vayeate-theme-studio/src/app/<domain>/components/` (or pages subtree).
2. **PascalCase** component; file **kebab-case** matching default export name.
3. For each event, define a **named function** (e.g. `function onControlAction() { … }`) and pass it by name on the element (`onClick={onControlAction}`). Do not pass inline arrow functions directly to event props. Build **one** action object and enqueue (ActionQueue / dispatcher pattern in project).
4. Use **viewmodel** hooks for state; never resolve controllers/operations in the component.

## Checklist

- [ ] Action type follows `<CONTROL>_<ACTION>`; payload not state-derived
- [ ] Event props reference named handler functions only — no inline arrows on JSX elements
- [ ] No business logic; no direct state setters
