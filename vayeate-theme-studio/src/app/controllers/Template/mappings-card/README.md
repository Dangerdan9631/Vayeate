# Mappings Card

Controller entry points that orchestrate validations and operations for the Template UI domain.

## Placement

- Path: `src/app/controllers/Template/mappings-card`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Template`

## Contents

- Subfolders: None
- Files: `add-semantic-variant-controller.ts`, `apply-selected-mapping-assignment-controller.ts`, `clear-selected-mappings-controller.ts`, `remove-mapping-controller.ts`, `set-mapping-color-ref-controller.ts`, `set-mapping-color-variable-filter-controller.ts`, `set-mapping-contrast-ref-controller.ts`, `set-mapping-contrast-variable-filter-controller.ts`, `set-mapping-group-ref-controller.ts`, `set-mapping-group-selection-controller.ts`, `set-mapping-ignored-controller.ts`, `set-mapping-search-text-controller.ts`, `set-mapping-style-ref-controller.ts`, `set-mapping-style-variable-filter-controller.ts`, `set-mapping-token-type-selection-controller.ts`, `toggle-selected-mapping-controller.ts`, `update-semantic-variant-key-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

