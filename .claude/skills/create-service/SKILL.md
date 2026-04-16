---
name: create-service
description: Adds or changes a service for system I/O in Vayeate Theme Studio. Use for filesystem, IPC, or window APIs without business logic.
---

# Create / modify Service

## Authority

[`.cursor/rules/service.mdc`](../../rules/service.mdc), [`.cursor/rules/layer-gateway.mdc`](../../rules/layer-gateway.mdc).

## Workflow

1. Place in `vayeate-theme-studio/src/gateway/services/`.
2. **`@singleton()`**; thin wrappers over Electron/Node/browser APIs — no string or symbol tokens.
3. Return data or propagate typed errors; **no** catalog/theme/template rules.
4. Consumed by **gateways** or **operations** per architecture.

## Checklist

- [ ] No imports from `src/domain` business modules
- [ ] IPC to main lives here (renderer side), not in components
