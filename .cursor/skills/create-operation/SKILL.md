---
name: create-operation
description: Adds or changes a domain Operation in Vayeate Theme Studio. Use when implementing business logic, state writes, or gateway calls from the domain layer.
---

# Create / modify Operation

## Authority

[`.cursor/rules/operation.mdc`](../../rules/operation.mdc), [`.cursor/rules/layer-domain.mdc`](../../rules/layer-domain.mdc), [`.cursor/rules/app-architecture.mdc`](../../rules/app-architecture.mdc).

## Workflow

1. Place in `vayeate-theme-studio/src/domain/<domain>/operations/`.
2. Kebab-case file; export one **`SomethingOperation`** with **`execute(...)`** only.
3. **`@singleton()`**; inject concrete gateways, services, and store classes — no string or symbol tokens.
4. Implement **single** logical change; call **no** other operations.

## Skeleton

```ts
import { singleton } from 'tsyringe';

@singleton()
export class ExampleOperation {
  constructor(/* store, gateways */) {}

  execute(args: { /* explicit inputs */ }): void {}
}
```

## Checklist

- [ ] Only controllers invoke this operation
- [ ] No `otherOperation.execute`
- [ ] Store writes only here (via store method), not in controller
