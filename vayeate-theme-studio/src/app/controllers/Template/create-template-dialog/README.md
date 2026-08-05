# Create Template Dialog

Controller entry points that orchestrate validations and operations for the Template UI domain.

## Placement

- Path: `src/app/controllers/Template/create-template-dialog`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Template`

## Contents

- Subfolders: None
- Files: `close-create-dialog-controller.ts`, `create-template-controller.ts`, `set-create-form-name-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

