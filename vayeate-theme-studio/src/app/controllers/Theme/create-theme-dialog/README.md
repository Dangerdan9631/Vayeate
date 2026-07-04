# Create Theme Dialog

Controller entry points that orchestrate validations and operations for the Theme UI domain.

## Placement

- Path: `src/app/controllers/Theme/create-theme-dialog`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `close-theme-create-dialog-controller.ts`, `create-theme-controller.ts`, `set-theme-create-form-name-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

