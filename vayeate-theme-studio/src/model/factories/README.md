# Factories

Pure constructors that build default **Theme** and **Template** drafts from minimal input. Factories centralize initial field values so create flows in domain operations and gateways stay consistent.

## Layout

| File | Role |
|------|------|
| `theme-factory.ts` | `createThemeWithParams` — new theme with version `1.0.0`, empty refs/assignments, and default palette settings |
| `template-factory.ts` | `createTemplateWithParams` — new template with version `1.0.0`, unlocked, and empty catalogs, mappings, and variables |

## Conventions

- Factories return schema types from `schema/theme-schemas.ts` and `schema/template-schemas.ts`; they do not validate or persist.
- Callers supply only user-provided values (currently `name`); all other fields use documented defaults in the factory.
- No I/O, React, or dependency injection — same boundaries as the rest of `src/model/`.
