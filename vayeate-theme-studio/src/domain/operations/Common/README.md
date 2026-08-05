# Common

Policy-owned domain operations for the Common business domain.

## Placement

- Path: `src/domain/operations/Common`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Common`

## Contents

- Subfolders: `action-queue`, `app-operations`, `background-queue`, `eyedropper-operations`, `undo-operations`, `window-operations`
- Files: None

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

