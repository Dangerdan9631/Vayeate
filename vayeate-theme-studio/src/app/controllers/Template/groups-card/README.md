# Groups Card

Controller entry points that orchestrate validations and operations for the Template UI domain.

## Placement

- Path: `src/app/controllers/Template/groups-card`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Template`

## Contents

- Subfolders: None
- Files: `add-group-and-clear-input-controller.ts`, `add-group-controller.ts`, `remove-group-controller.ts`, `set-template-add-group-name-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

