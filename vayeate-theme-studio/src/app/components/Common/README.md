# Common

React components and component-local UI helpers for the Common UI domain.

## Placement

- Path: `src/app/components/Common`
- Layer: App layer
- Role bucket: `components`
- Domain bucket: `Common`

## Contents

- Subfolders: `app-shell`, `eyedropper-overlay`, `menu-bar`, `resizable-columns`, `ribbon`, `status-bar`, `styled-tooltip`, `tristate-checkbox`, `virtualized-row-list`
- Files: None

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

