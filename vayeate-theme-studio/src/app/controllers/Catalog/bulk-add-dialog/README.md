# Bulk Add Dialog

Controller entry points that orchestrate validations and operations for the Catalog UI domain.

## Placement

- Path: `src/app/controllers/Catalog/bulk-add-dialog`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `bulk-add-tokens-controller.ts`, `close-bulk-add-dialog-controller.ts`, `open-bulk-add-dialog-controller.ts`, `set-catalog-bulk-add-text-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

