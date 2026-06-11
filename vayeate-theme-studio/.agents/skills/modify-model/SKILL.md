---
name: modify-model
description: Domain model definitions, zod schema patterns, and type inference conventions. Use when authoring, modifying, or interacting with domain models
---

# Model

## Rules

- Domain shapes and parsers live in **`src/model/`**.
- Use **zod** for persisted, external, or runtime-parsed model families. Simple internal value objects/constants may use plain TypeScript types when no boundary parsing is needed.
- Keep models **free** of React, DI, and I/O (no `fs`, no `ipc`).

## Files

- Keep one cohesive model family per file; **kebab-case** filename aligned with the family. Schema modules may export the related zod schemas, inferred types, constants, and helpers for that model family.

**Convention tests (keep in sync):** [`vayeate-theme-studio/test/architecture/architecture.test.ts`](vayeate-theme-studio/test/architecture/architecture.test.ts). **When kebab-case or exclusion rules change there or here, update that `describe` and vice versa.**

## Good / bad

```ts
// GOOD
export const CatalogSchema = z.object({ id: z.string(), ... });
export type Catalog = z.infer<typeof CatalogSchema>;

// BAD — model imports electron ipc
import { ipcRenderer } from 'electron';
```
