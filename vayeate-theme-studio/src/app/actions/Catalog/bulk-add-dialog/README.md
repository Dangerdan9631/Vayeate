# Bulk Add Dialog

Action types, guards, and handlers for the Catalog UI domain.

## Placement

- Path: `src/app/actions/Catalog/bulk-add-dialog`
- Layer: App layer
- Role bucket: `actions`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `catalog-bulk-add-dialog-action-type.ts`, `catalog-bulk-add-dialog-handler.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

