# Theme

Pure domain helpers for the Theme business domain.

## Placement

- Path: `src/domain/utils/Theme`
- Layer: Domain layer
- Role bucket: `utils`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `assert-valid-theme-file-name.ts`, `color-adjust-contrast.ts`, `color-clustering.ts`, `color-hex.ts`, `color-hsl.ts`, `color-types.ts`, `color-wcag.ts`, `compute-display-color-assignments.ts`, `compute-selected-colors-display.ts`, `contrast-utils.ts`, `derive-theme-pane-fields.ts`, `normalize-theme-hex.ts`, `palette-cluster-inputs.ts`, `resolve-editor-preview-lines.ts`, `scope-resolver-worker-messages.ts`, `scope-resolver.ts`, `scope-theme-generation-inputs.ts`, `stringify-theme.ts`, `theme-assignment-utils.ts`, `theme-contrast-undo-utils.ts`, `theme-generator.ts`, `theme-orphan-keys.ts`, `theme-palette-assign-undo-utils.ts`, `theme-pane-utils.ts`, `theme-stack-id.ts`, `to-safe-theme-file-name.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

