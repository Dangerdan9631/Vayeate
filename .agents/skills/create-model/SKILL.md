---
name: create-model
description: Adds or changes domain models and zod schemas in Vayeate Theme Studio. Use for new entity types, parsers, or shared DTO shapes.
---

# Create / modify Model

## Authority

[`.cursor/rules/model.mdc`](../../rules/model.mdc), [`.cursor/rules/app-architecture.mdc`](../../rules/app-architecture.mdc).

## Workflow

1. Place in `vayeate-theme-studio/src/model/` (subfolders as existing project does).
2. Define **zod** schema + `z.infer` type (or explicit type + schema pair).
3. **One** top-level export focus per file; kebab-case filename.
4. No DI decorators, no React, no electron imports.

## Skeleton

```ts
import { z } from 'zod';

export const ExampleSchema = z.object({ id: z.string() });
export type Example = z.infer<typeof ExampleSchema>;
```

## Checklist

- [ ] Parsing/validation at boundaries uses these schemas (gateways/operations), not ad-hoc `as` casts
