---
name: create-controller
description: Adds or changes an app Controller in Vayeate Theme Studio. Use when the user creates or edits a controller, wires an action to app logic, or asks for controller patterns under src/app.
---

# Create / modify Controller

## Authority

Follow conventions in [`.cursor/rules/controller.mdc`](../../rules/controller.mdc) and layer rules in [`.cursor/rules/layer-app.mdc`](../../rules/layer-app.mdc) / [`.cursor/rules/app-architecture.mdc`](../../rules/app-architecture.mdc).

## Workflow

1. Place in an app-layer controller folder under `vayeate-theme-studio/src/app/**/controllers/`. Follow the existing feature structure, including feature-root folders, colocated component folders, and shared `common` or `core` controller folders where appropriate.
2. Name file **kebab-case** matching class (e.g. `delete-current-catalog-controller.ts` → `DeleteCurrentCatalogController`).
3. Add **`@singleton()`** class with **`run(...): …`** only; inject concrete operation, validation, and store classes as needed — no string or symbol tokens — **do not** inject or call other controllers. A controller may sequence multiple operations for one UI use case after validation, but reusable domain algorithms belong in operations.
4. Wire **handler** to call or `await` `container.resolve(...).run(action)` based on whether the controller is sync or async — no logic in handler.

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
