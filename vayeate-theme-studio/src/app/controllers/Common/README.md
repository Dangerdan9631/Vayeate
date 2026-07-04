# Common

Controller entry points that orchestrate validations and operations for the Common UI domain.

## Placement

- Path: `src/app/controllers/Common`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Common`

## Contents

- Subfolders: `app-shell`, `eyedropper-overlay`, `menu-bar`, `ribbon`, `styled-tooltip`, `window`
- Files: None

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

