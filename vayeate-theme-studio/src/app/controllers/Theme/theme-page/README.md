# Theme Page

Controller entry points that orchestrate validations and operations for the Theme UI domain.

## Placement

- Path: `src/app/controllers/Theme/theme-page`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `clear-theme-save-error-controller.ts`, `load-theme-page-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

