# Templates Card

Action types, guards, and handlers for the Template UI domain.

## Placement

- Path: `src/app/actions/Template/templates-card`
- Layer: App layer
- Role bucket: `actions`
- Domain bucket: `Template`

## Contents

- Subfolders: None
- Files: `templates-card-action-type.ts`, `templates-card-handler.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

