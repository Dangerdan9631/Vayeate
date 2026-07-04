# Undo Operations

Policy-owned domain operations for the Common business domain.

## Placement

- Path: `src/domain/operations/Common/undo-operations`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `apply-catalog-lifecycle-undo-operation.ts`, `apply-catalog-source-url-undo-operation.ts`, `apply-catalog-undo-state-operation.ts`, `apply-template-lifecycle-undo-operation.ts`, `apply-template-undo-state-operation.ts`, `apply-theme-lifecycle-undo-operation.ts`, `apply-theme-undo-state-operation.ts`, `build-universal-undo-processor-operation.ts`, `catalog-undo-handlers.ts`, `clear-persisted-undo-operation.ts`, `history-go-to-operation.ts`, `load-undo-history-operation.ts`, `record-catalog-undo-operation.ts`, `record-template-undo-operation.ts`, `record-theme-undo-operation.ts`, `record-undo-entry-operation.ts`, `redo-operation.ts`, `restore-theme-palette-assign-undo-operation.ts`, `set-current-undo-stack-id-operation.ts`, `template-undo-handlers.ts`, `theme-undo-handlers.ts`, `undo-operation-helpers.ts`, `undo-operation.ts`, `undo-persistence-port.ts`, `undo-values-equal.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

