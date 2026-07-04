# Common

App-layer infrastructure for the Common domain.

## Placement

- Path: `src/domain/core/Common`
- Layer: Domain layer
- Role bucket: `core`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `scheduler.ts`, `undo-manager-v2.ts`, `undo-processor.ts`, `undo-stack-persist-scheduler.ts`, `undo-stack-types.ts`, `undo-stack.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

