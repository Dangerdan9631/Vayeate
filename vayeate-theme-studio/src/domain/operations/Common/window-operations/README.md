# Window Operations

Policy-owned domain operations for the Common business domain.

## Placement

- Path: `src/domain/operations/Common/window-operations`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `drag-window-operation.ts`, `reload-window-operation.ts`, `set-viewport-size-operation.ts`, `set-window-display-state-operation.ts`, `set-window-position-operation.ts`, `set-window-size-operation.ts`, `set-window-state-operation.ts`, `toggle-dev-tools-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

