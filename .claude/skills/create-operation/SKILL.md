---
name: create-operation
description: Adds or changes a domain Operation in Vayeate Theme Studio. Use when implementing business logic, state writes, or gateway calls from the domain layer.
---

# Create / modify Operation

## Authority

[`.cursor/rules/operation.mdc`](../../rules/operation.mdc), [`.cursor/rules/layer-domain.mdc`](../../rules/layer-domain.mdc), [`.cursor/rules/app-architecture.mdc`](../../rules/app-architecture.mdc).

## Workflow

1. Place in an operation folder under `vayeate-theme-studio/src/domain/**/operations/`, following the existing structure. This includes domain-owned folders, shared legacy folders such as `src/domain/operations/<feature>-operations/**`, and UI-domain operation folders.
2. Kebab-case file; export one **`SomethingOperation`** whose public entrypoint is **`execute(...)`**. Private helper methods are allowed when they support the same atomic operation.
3. **`@singleton()`**; inject concrete gateways, services, and store classes — no string or symbol tokens, except the documented queue-adapter case where `EnqueueActionQueueOperation` may inject the registered `IActionQueue` token.
4. Implement **single** logical change. Do not orchestrate peer domain operations. Keep the documented architecture exceptions only: the queue adapter/background queue bridge and other explicitly documented exceptions in the project rules.

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
- [ ] No peer `otherOperation.execute` orchestration outside documented exceptions
- [ ] Store writes only here (via store method), not in controller
