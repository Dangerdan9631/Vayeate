# Theme Palette Card

Controller entry points that orchestrate validations and operations for the Theme UI domain.

## Placement

- Path: `src/app/controllers/Theme/theme-palette-card`
- Layer: App layer
- Role bucket: `controllers`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `assign-color-from-picker-controller.ts`, `commit-assign-color-eye-dropper-controller.ts`, `commit-hue-reference-color-controller.ts`, `commit-hue-reference-eye-dropper-color-controller.ts`, `compute-palette-clusters-controller.ts`, `persist-current-theme-controller.ts`, `recenter-hue-reference-controller.ts`, `record-commit-hue-reference-color-undo.ts`, `record-palette-color-assign-undo.ts`, `set-apply-palette-to-dark-controller.ts`, `set-apply-palette-to-light-controller.ts`, `set-assign-color-preview-controller.ts`, `set-color-refs-selection-batch-controller.ts`, `set-palette-cluster-by-dark-controller.ts`, `set-palette-cluster-count-k-controller.ts`, `set-palette-cluster-count-k-preview-controller.ts`, `set-theme-hue-adjustment-controller.ts`, `set-theme-saturation-adjustment-controller.ts`, `set-theme-value-adjustment-controller.ts`

## Rules

- Keep React rendering, action construction, handlers, controllers, and viewmodels in the app layer.
- Components call viewmodel callbacks; viewmodels enqueue actions; handlers call controllers; controllers call validations and operations.
- Do not write domain stores or perform business mutation in app code.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

