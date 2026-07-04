# App Shell

Action types, guards, and handlers for the Common UI domain.

## Placement

- Path: `src/app/actions/Common/app-shell`
- Layer: App layer
- Role bucket: `actions`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `app-shell-action-type.ts`, `app-shell-handler.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

