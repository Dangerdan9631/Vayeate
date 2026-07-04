# Background Queue

Policy-owned domain operations for the Common business domain.

## Placement

- Path: `src/domain/operations/Common/background-queue`
- Layer: Domain layer
- Role bucket: `operations`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `background-queue-port.ts`, `complete-background-queue-processing-operation.ts`, `enqueue-background-queue-action-operation.ts`, `immediate-continuation.ts`, `update-background-queue-status-operation.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

