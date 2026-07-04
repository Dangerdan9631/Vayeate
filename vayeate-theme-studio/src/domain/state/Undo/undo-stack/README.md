# Undo Stack

Zustand state shapes and stores for the Common business domain.

## Placement

- Path: `src/domain/state/Undo/undo-stack`
- Layer: Domain layer
- Role bucket: `state`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `undo-stack-state.ts`, `undo-stack-store.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

