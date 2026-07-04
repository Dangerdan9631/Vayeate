# Theme

Action types, guards, and handlers for the Theme UI domain.

## Placement

- Path: `src/app/actions/Theme`
- Layer: App layer
- Role bucket: `actions`
- Domain bucket: `Theme`

## Contents

- Subfolders: `create-theme-dialog`, `editor-previews-card`, `theme-details-card`, `theme-page`, `theme-palette-card`, `theme-variables-card`, `themes-card`
- Files: `theme-action-type.ts`, `theme-handler.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

