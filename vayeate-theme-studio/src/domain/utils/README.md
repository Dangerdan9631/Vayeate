# Domain utils

Pure helpers used across the domain layer: color math, semver, scope resolution, theme generation, template/catalog merges, and derived UI pane fields. These modules do not mutate stores or call gateways directly.

## Purpose

- Centralize reusable transforms and derivations so operations and controllers stay thin.
- Keep renderer-safe color and preview logic colocated with theme/template rules.
- Provide stable identifiers and equality helpers for undo stacks and memoization.

## Organization

Files are flat under `src/domain/utils/` and grouped by concern rather than nested folders:

| Area | Modules | Role |
|------|---------|------|
| **Color** | `color-hex`, `color-hsl`, `color-types`, `color-wcag`, `color-adjust-contrast`, `color-clustering`, `normalize-theme-hex` | Hex/RGB/HSL conversion, WCAG contrast, hue shift, clustering for palette UI |
| **Scope & preview** | `scope-resolver`, `resolve-editor-preview-lines` | Map TextMate scopes to theme colors; build editor preview tokens and tooltips |
| **Theme generation** | `theme-generator`, `stringify-theme`, `to-safe-theme-file-name`, `assert-valid-theme-file-name` | Build VS Code theme JSON from theme + template; export formatting |
| **Theme pane** | `derive-theme-pane-fields`, `theme-pane-utils`, `compute-display-color-assignments`, `compute-selected-colors-display`, `theme-assignment-utils`, `palette-cluster-inputs` | Derive palette/editor preview display state from theme UI inputs |
| **Template & catalog** | `theme-template-merge`, `template-catalog-merge`, `compute-orphan-keys`, `theme-orphan-keys`, `is-mapping-orphan-for-template`, `referenced-*-from-template`, `group-names-in-use-from-template` | Merge assignments/mappings; detect orphan tokens and referenced variables |
| **Versioning & refs** | `parse-semver`, `compare-versions`, `next-patch-version`, `find-best-version-ref`, `find-nearest-version-ref`, `entity-refs-changed`, `catalog-versions-by-name-from-refs` | Semver parsing, ref selection after deletes, directory ref change detection |
| **Undo stacks** | `catalog-stack-id`, `template-stack-id`, `theme-stack-id` | Stable stack id strings for undo history |
| **Contrast editing** | `contrast-utils` | Parse and update contrast assignment values in theme state |
| **Logging** | `logger` | Category-scoped logger wrapper over `LogService` |

## Conventions

- **Pure functions** — no store writes; callers pass inputs and receive new values.
- **Top-level exports only** — internal helpers stay unexported unless shared within the file.
- **Models live in `src/model/`** — utils consume schema types; they do not define domain entities.
- **JSDoc on exports** — each exported function, type, constant, and class documents inward behavior for maintainers.

For layer boundaries and mutation rules, see [../README.md](../README.md) and the project root [AGENTS.md](../../../AGENTS.md).
