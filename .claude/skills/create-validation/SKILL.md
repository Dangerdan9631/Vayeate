---
name: create-validation
description: Adds or changes a Validate* validation in Vayeate Theme Studio. Use for gating controllers and viewmodels with shared boolean or message-bearing rules.
---

# Create / modify Validation

## Authority

[`.cursor/rules/validation.mdc`](../../rules/validation.mdc), [`.cursor/rules/layer-domain.mdc`](../../rules/layer-domain.mdc).

## Workflow

1. Place in `vayeate-theme-studio/src/domain/<domain>/validations/`.
2. Name **`Validate` + question** (PascalCase class or module export per project style).
3. Expose **`test(...)`** returning either `boolean` for simple predicates or `ValidationResult` for UI-facing validation messages; **no** throws; **no** calls to other validations.
4. Inject concrete getter/state types if state read is needed; class-based validations use **`@singleton()`** — no string or symbol tokens.

## Skeleton

```ts
import { singleton } from 'tsyringe';

@singleton()
export class ValidateCanDoExample {
  test(/* inputs */): boolean {
    return true;
  }
}
```

## Checklist

- [ ] Controllers may throw on `!test()`; validation never throws
- [ ] Viewmodel can expose the same validator for UI state, including message-bearing `ValidationResult` usage when needed.
