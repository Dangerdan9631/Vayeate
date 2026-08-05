# Themes Card

Controller entry points that orchestrate validations and operations for the Theme UI domain.

## Placement

- Path: `src/app/controllers/Theme/themes-card`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `open-theme-create-dialog-controller.ts`, `open-theme-duplicate-dialog-controller.ts`, `select-theme-and-load-controller.ts`, `select-theme-by-name-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

