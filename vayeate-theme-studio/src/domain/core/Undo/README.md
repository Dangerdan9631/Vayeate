# Undo

Domain-layer undo stack, processor, and persistence scheduling.

## Placement

- Path: `src/domain/core/Undo`
- Layer: Domain layer
- Role bucket: `core`
- Domain bucket: `Undo`

## Contents

- Subfolders: None
- Files: `undo-manager-v2.ts`, `undo-processor.ts`, `undo-stack-persist-scheduler.ts`, `undo-stack-types.ts`, `undo-stack.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.
