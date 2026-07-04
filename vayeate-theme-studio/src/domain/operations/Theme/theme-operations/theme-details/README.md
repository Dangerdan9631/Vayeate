# Theme Details

Policy-owned domain operations for the Theme business domain.

## Placement

- Path: `src/domain/operations/Theme/theme-operations/theme-details`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `apply-theme-state-and-schedule-persist-operation.ts`, `apply-theme-state-operation.ts`, `clear-pending-theme-save-operation.ts`, `generate-theme-operation.ts`, `load-theme-operation.ts`, `load-theme-with-linked-template-operation.ts`, `save-theme-operation.ts`, `set-color-use-dark-for-light-operation.ts`, `set-color-variable-dark-operation.ts`, `set-color-variable-light-operation.ts`, `set-contrast-use-dark-for-light-operation.ts`, `set-contrast-variable-field-operation.ts`, `set-generate-result-operation.ts`, `set-style-use-dark-for-light-operation.ts`, `set-style-variable-field-operation.ts`, `set-theme-apply-palette-to-dark-operation.ts`, `set-theme-apply-palette-to-light-operation.ts`, `set-theme-loaded-template-operation.ts`, `set-theme-operation.ts`, `set-theme-palette-cluster-count-operation.ts`, `set-theme-preview-token-ref-field-operation.ts`, `set-theme-save-error-operation.ts`, `theme-color-variable-edit-result.ts`, `theme-contrast-variable-edit-result.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

