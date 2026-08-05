# Theme Details Card

Controller entry points that orchestrate validations and operations for the Theme UI domain.

## Placement

- Path: `src/app/controllers/Theme/theme-details-card`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `delete-theme-version-controller.ts`, `generate-all-themes-controller.ts`, `generate-theme-controller.ts`, `generate-theme-screenshots-controller.ts`, `increment-theme-version-controller.ts`, `set-theme-preview-token-ref-controller.ts`, `set-theme-template-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

