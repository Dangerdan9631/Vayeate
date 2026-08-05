# Eyedropper Operations

Policy-owned domain operations for the Common business domain.

## Placement

- Path: `src/domain/operations/Common/eyedropper-operations`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `close-eyedropper-operation.ts`, `eyedropper-loupe-operation.ts`, `eyedropper-zoom-operation.ts`, `load-eyedropper-snapshot-operation.ts`, `open-eyedropper-operation.ts`, `set-eyedropper-overlay-viewport-size-operation.ts`, `update-eyedropper-pointer-operation.ts`, `update-eyedropper-zoom-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

