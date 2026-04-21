---
name: create-validation
description: Adds or changes a Validate* validation in Vayeate Theme Studio. Use for gating controllers and viewmodels with boolean or message-bearing validation rules.
---

# Create / modify Validation

## Authority

[`.cursor/rules/validation.mdc`](../../rules/validation.mdc), [`.cursor/rules/layer-domain.mdc`](../../rules/layer-domain.mdc).

## Workflow

1. Place in `vayeate-theme-studio/src/domain/<business-domain>/validations/` for domain-owned validations, or `src/domain/validations/<feature>-validations/` for shared/legacy validations.
2. Name **`Validate` + question** (PascalCase class or module export per project style).
3. Expose **`test(...): boolean`** for simple guards or **`test(...): ValidationResult`** for UI-facing validation that needs an error message; **no** throws; **no** calls to other validations.
4. Inject concrete getter/state types if state read is needed; class-based validations use **`@singleton()`** — no string or symbol tokens.
5. Use `Validator<T>` as the composition helper when sequencing multiple message-bearing validations; individual `Validate*` classes should stay focused and not call peers directly.

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

```ts
import { singleton } from 'tsyringe';
import { VALIDATION_RESULT_OK, ValidationResult } from '../../../model/validation-result';

@singleton()
export class ValidateExampleNameIsValid {
  test(name: string): ValidationResult {
    return name.trim() === ''
      ? { isValid: false, errorMessage: 'Name is required.' }
      : VALIDATION_RESULT_OK;
  }
}
```

## Checklist

- [ ] Controllers may throw on `!test()`; validation never throws
- [ ] Viewmodel can expose same validator for UI state and react component usage.
- [ ] `Validator<T>` handles multi-validation composition when returning `ValidationResult`
