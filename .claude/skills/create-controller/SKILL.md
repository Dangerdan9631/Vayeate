---
name: create-controller
description: Adds or changes a domain Controller in Vayeate Theme Studio. Use when the user creates or edits a controller, wires an action to app logic, or asks for controller patterns under src/domain.
---

# Create / modify Controller

## Authority

Follow conventions in [`.cursor/rules/controller.mdc`](../../rules/controller.mdc) and layer rules in [`.cursor/rules/layer-domain.mdc`](../../rules/layer-domain.mdc) / [`.cursor/rules/app-architecture.mdc`](../../rules/app-architecture.mdc).

## Workflow

1. Pick domain folder: `vayeate-theme-studio/src/domain/<domain>/controllers/`.
2. Name file **kebab-case** matching class (e.g. `delete-current-catalog-controller.ts` → `DeleteCurrentCatalogController`).
3. Add **`@singleton()`** class with **`run(...): …`** only; inject concrete operation, validation, and store classes as needed — no string or symbol tokens — **do not** inject or call other controllers.
4. Wire **handler** to `await container.resolve(...).run(action)` — no logic in handler.

## Skeleton

```ts
import { singleton } from 'tsyringe';
import { ExampleOperation } from '../operations/example-operation';
import { ValidateCanDoExample } from '../validations/validate-can-do-example';

@singleton()
export class ExampleController {
  constructor(
    private readonly op: ExampleOperation,
    private readonly validate: ValidateCanDoExample,
  ) {}

  run(input: { /* action payload */ }): void {
    if (!this.validate.test(input)) throw new Error('Validation failed');
    this.op.execute({ /* mapped args */ });
  }
}
```

## Checklist

- [ ] UI-agnostic name; suffix `Controller`
- [ ] May read store snapshot, but does not mutate store state; only `run`
- [ ] Does not call or inject other controllers
- [ ] Rules in [controller.mdc](../../rules/controller.mdc) satisfied
