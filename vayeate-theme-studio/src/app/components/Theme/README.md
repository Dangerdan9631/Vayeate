# Theme

React components and component-local UI helpers for the Theme UI domain.

## Placement

- Path: `src/app/components/Theme`
- Layer: App layer
- Role bucket: `components`
- Domain bucket: `Theme`

## Contents

- Subfolders: `create-theme-dialog`, `editor-previews-card`, `theme-details-card`, `theme-page`, `theme-palette-card`, `theme-variables-card`, `themes-card`
- Files: None

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

