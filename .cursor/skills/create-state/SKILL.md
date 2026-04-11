---
name: create-state
description: Adds or changes domain state slices and accessors in Vayeate Theme Studio. Use when introducing new app state shape or getters/setters.
---

# Create / modify State

## Authority

[`.cursor/rules/state.mdc`](../../rules/state.mdc), [`.cursor/rules/layer-domain.mdc`](../../rules/layer-domain.mdc).

## Workflow

1. Place slice types and reducers/helpers under `vayeate-theme-studio/src/domain/<domain>/state/`.
2. Ensure root aggregate holds **only** nested slices (no ad-hoc root fields).
3. Expose **immutable** updates: **getter** for reads, **setter** used **only** from operations. **Exception:** queue-status wiring consumed **only** by `ActionQueue` (see [app-architecture.mdc](../../rules/app-architecture.mdc)); do not expose that setter to handlers or operations.
4. Wire slice into the single app state aggregate and context provider per existing app pattern.

## Checklist

- [ ] No React imports in state modules
- [ ] Components never import setters
- [ ] Controllers read via getter; operations write via setter
- [ ] If adding queue-status fields, only `ActionQueue` invokes the dedicated setter — not operations
