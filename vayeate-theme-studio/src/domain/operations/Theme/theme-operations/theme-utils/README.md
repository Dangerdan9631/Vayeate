# Theme Utils

Theme operation modules for color math, scope resolution, preview derivation, palette assignment, theme generation, and related Theme transforms.

## Placement

- Path: `src/domain/operations/Theme/theme-operations/theme-utils`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `assert-valid-theme-file-name-operation.ts`, `color-adjust-contrast-operation.ts`, `color-clustering-operation.ts`, `color-hex-operation.ts`, `color-hsl-operation.ts`, `color-types-operation.ts`, `color-wcag-operation.ts`, `compute-display-color-assignments-operation.ts`, `compute-selected-colors-display-operation.ts`, `contrast-utils-operation.ts`, `derive-theme-pane-fields-operation.ts`, `normalize-theme-hex-operation.ts`, `palette-cluster-inputs-operation.ts`, `resolve-editor-preview-lines-operation.ts`, `scope-resolver-operation.ts`, `scope-resolver-worker-messages-operation.ts`, `scope-theme-generation-inputs-operation.ts`, `stringify-theme-operation.ts`, `theme-assignment-utils-operation.ts`, `theme-contrast-undo-utils-operation.ts`, `theme-generator-operation.ts`, `theme-orphan-keys-operation.ts`, `theme-palette-assign-undo-utils-operation.ts`, `theme-pane-utils-operation.ts`, `to-safe-theme-file-name-operation.ts`

## Rules

- Keep Theme business transforms and derived theme calculations in operation modules.
- Do not restore `src/domain/utils/Theme`; new Theme behavior belongs in operations or validations.
- Keep worker-safe pure helpers free of React, Electron main-process APIs, and raw filesystem access.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.
