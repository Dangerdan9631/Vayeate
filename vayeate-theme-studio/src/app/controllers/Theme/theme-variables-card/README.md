# Theme Variables Card

Controller entry points that orchestrate validations and operations for the Theme UI domain.

## Placement

- Path: `src/app/controllers/Theme/theme-variables-card`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `record-theme-pane-selection-undo.ts`, `set-color-use-dark-for-light-controller.ts`, `set-color-variable-dark-controller.ts`, `set-color-variable-light-controller.ts`, `set-contrast-use-dark-for-light-controller.ts`, `set-contrast-variable-dark-max-controller.ts`, `set-contrast-variable-dark-method-controller.ts`, `set-contrast-variable-dark-min-controller.ts`, `set-contrast-variable-dark-value-controller.ts`, `set-contrast-variable-light-max-controller.ts`, `set-contrast-variable-light-method-controller.ts`, `set-contrast-variable-light-min-controller.ts`, `set-contrast-variable-light-value-controller.ts`, `set-style-use-dark-for-light-controller.ts`, `set-style-variable-field-controller.ts`, `set-theme-variables-search-text-controller.ts`, `set-variables-select-all-controller.ts`, `set-variables-select-by-group-controller.ts`, `set-variables-select-by-type-controller.ts`, `toggle-variable-selection-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

