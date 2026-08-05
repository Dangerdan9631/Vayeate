# Catalog Details Card

Controller entry points that orchestrate validations and operations for the Catalog UI domain.

## Placement

- Path: `src/app/controllers/Catalog/catalog-details-card`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `add-new-source-controller.ts`, `delete-current-catalog-version-controller.ts`, `lock-catalog-controller.ts`, `remove-source-controller.ts`, `revert-catalog-to-version-controller.ts`, `set-catalog-new-source-token-type-controller.ts`, `set-catalog-new-source-type-controller.ts`, `set-catalog-new-source-url-controller.ts`, `sync-catalog-controller.ts`, `update-source-token-type-controller.ts`, `update-source-type-controller.ts`, `update-source-url-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

