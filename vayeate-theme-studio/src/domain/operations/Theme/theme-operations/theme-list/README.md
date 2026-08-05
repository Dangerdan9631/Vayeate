# Theme List

Policy-owned domain operations for the Theme business domain.

## Placement

- Path: `src/domain/operations/Theme/theme-operations/theme-list`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `create-theme-operation.ts`, `delete-theme-operation.ts`, `get-theme-refs-operation.ts`, `load-theme-refs-operation.ts`, `set-selected-theme-ref-operation.ts`, `set-theme-create-dialog-mode-operation.ts`, `set-theme-create-dialog-open-operation.ts`, `set-theme-create-form-name-operation.ts`, `set-theme-is-creating-operation.ts`, `set-theme-refs-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

