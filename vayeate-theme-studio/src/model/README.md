# Model layer

Domain shapes, parsers, and shared value types for Vayeate Theme Studio. Models are pure TypeScript: no React, dependency injection, or I/O.

## Layout

| Location | Role |
|----------|------|
| `schema/` | Persisted and boundary-parsed entities (catalog, template, theme, primitives) with **zod** schemas and `z.infer` types |
| Top-level `*.ts` | Cross-cutting helpers, UI affordances, undo metadata, geometry, and import parsers that compose schema types |

One cohesive model family per file; filenames use **kebab-case** aligned with the concept.

## Zod validation

Use zod when data crosses a boundary (disk, IPC, user paste, external JSON):

- Define a schema constant (e.g. `undoEntrySchema`, `themeImportSchema`).
- Export the inferred type: `export type UndoEntry = z.infer<typeof undoEntrySchema>`.
- Parse at the boundary with `.parse()` or `.safeParse()`; keep business rules in domain operations, not in models.

Simple internal value objects (points, rects, tab IDs) may use plain TypeScript types when nothing is parsed at runtime.

Primitives and field-level constraints live in `schema/primitives.ts`; entity schemas compose those building blocks in `schema/catalog.ts`, `schema/template-schemas.ts`, and `schema/theme-schemas.ts`.

## Shared concepts

- **References** — `name` + `version` pairs for catalog, template, and theme artifacts.
- **Undo** — `undo-history.ts` defines stack entries, diffs, and context keys; `undo-action-types.ts` lists registered diff action type strings per domain.
- **Semantic selectors** — VS Code-style `type.modifier:language` strings parsed and formatted under `semantic-selector-*` and `semantic-token-constants.ts`.
- **Validation result** — `{ isValid, errorMessage }` returned from validations to controllers.
- **Background queue keys** — `data-path-keys.ts` builds relative file paths used for `data_io` queue ordering.

## Conventions

- Models may import other models; they must not import app, domain operations, gateways, or Electron.
- Prefer `readonly()` on object schemas where immutability matches usage.
- Deprecated aliases (e.g. in `preview-types.ts`) remain for compatibility; prefer the non-deprecated names in new code.
