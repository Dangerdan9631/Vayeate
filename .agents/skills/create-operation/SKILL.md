---
name: create-operation
description: Adds or changes a domain Operation in Vayeate Theme Studio. Use when implementing business logic, state writes, or gateway calls from the domain layer.
---

# Create / modify Operation

## Authority

[`.cursor/rules/operation.mdc`](../../rules/operation.mdc), [`.cursor/rules/layer-domain.mdc`](../../rules/layer-domain.mdc), [`.cursor/rules/app-architecture.mdc`](../../rules/app-architecture.mdc).

## Workflow

1. Place in `vayeate-theme-studio/src/domain/**/operations/`, including `src/domain/operations/<feature>-operations/**` for shared/legacy operations and `src/domain/ui/**/operations/**` for UI-domain operations.
2. Kebab-case file; export one **`SomethingOperation`** with one public **`execute(...)`** method; private helpers are allowed when they keep one atomic operation readable.
3. **`@singleton()`**; inject concrete gateways, services, and store classes — no string or symbol tokens. Exception: `IActionQueue` is currently token-registered for the action queue interface; do not introduce other string/symbol DI tokens without updating the architecture rules.
4. Implement **single** logical change; call **no** other operations except the narrow architecture exceptions: `InitializeWindowCallbacksOperation` may register controller callbacks with `WindowService.init(...)`, operations may call `EnqueueBackgroundQueueActionOperation` only to enqueue asynchronous background work, and theme color-variable operations may call the documented theme state/persist helper pair.

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
- [ ] No `otherOperation.execute` except `EnqueueBackgroundQueueActionOperation.execute(...)` for background queue enqueueing or the documented theme color-variable state/persist helper pair
- [ ] Store writes only here (via store method), not in controller
