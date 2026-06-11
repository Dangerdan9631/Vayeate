# Schema

Zod schemas and inferred types for persisted catalog, template, and theme artifacts plus shared primitives. Parse at I/O boundaries with `.parse()` or `.safeParse()`; keep business rules in domain operations.

## Layout

| File | Role |
|------|------|
| `primitives.ts` | Shared regex-backed strings, enums, hex/contrast values, and app config |
| `catalog.ts` | Token catalog: sources, tokens, and semantic token registry lists |
| `template-schemas.ts` | Template: catalog refs, color/contrast variables, mappings, groups |
| `theme-schemas.ts` | Theme: template ref, IDE preview token refs, color/contrast assignments, palette settings |

## Conventions

- One schema constant per entity (e.g. `catalogSchema`); export the inferred type with `z.infer`.
- Compose field validators from `primitives.ts` rather than duplicating regex or enum rules.
- Prefer `.readonly()` on object schemas where artifacts are treated as immutable after parse.
- Cross-field rules (e.g. source `type` vs `tokenType`) live on the schema via `.refine()`; document fields and constraints in JSDoc above each property.
- No React, dependency injection, or I/O — same boundaries as the rest of `src/model/`.

## Validation flow

```
disk / IPC JSON  →  schema.safeParse  →  inferred Catalog | Template | Theme
```

Baseline fixtures under `data/catalogs`, `data/templates`, and `data/themes` are checked against these schemas in `baseline-artifacts.test.ts`.
