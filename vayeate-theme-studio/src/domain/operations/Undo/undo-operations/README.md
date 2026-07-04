# Undo Operations

Generic undo/redo/history orchestration for the Undo domain.

## Placement

- Path: `src/domain/operations/Undo/undo-operations`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Undo`

## Contents

- Subfolders: None
- Files: `build-universal-undo-processor-operation.ts`, `clear-persisted-undo-operation.ts`, `history-go-to-operation.ts`, `load-undo-history-operation.ts`, `record-undo-entry-operation.ts`, `redo-operation.ts`, `set-current-undo-stack-id-operation.ts`, `undo-operation-helpers.ts`, `undo-operation.ts`, `undo-persistence-port.ts`, `undo-values-equal.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.
