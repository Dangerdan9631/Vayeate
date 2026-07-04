# Create Dialog

Controller entry points that orchestrate validations and operations for the Catalog UI domain.

## Placement

- Path: `src/app/controllers/Catalog/create-dialog`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `close-catalog-create-dialog-controller.ts`, `open-catalog-create-dialog-controller.ts`, `set-catalog-create-dialog-name-controller.ts`, `set-catalog-create-dialog-type-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

