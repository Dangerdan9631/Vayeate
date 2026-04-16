---
name: create-gateway
description: Adds or changes a gateway in Vayeate Theme Studio. Use for mapping I/O or IPC payloads to domain models without business rules.
---

# Create / modify Gateway

## Authority

[`.cursor/rules/gateway.mdc`](../../rules/gateway.mdc), [`.cursor/rules/layer-gateway.mdc`](../../rules/layer-gateway.mdc).

## Workflow

1. Place in `vayeate-theme-studio/src/gateway/` (group by feature, not under `services/`).
2. **`@singleton()`**; inject concrete **service** types needed for raw reads/writes — no string or symbol tokens.
3. Methods: parse/serialize/map only; delegate heavy I/O to services.
4. Call from **operations** only.

## Checklist

- [ ] No domain decisions (validity, workflows) — only conversion and orchestration at the edge
- [ ] zod/model types from `src/model` where appropriate
