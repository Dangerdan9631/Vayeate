# Queue

Cooperative yielding helpers for deferred queue work.

## Placement

- Path: `src/domain/core/Queue`
- Layer: Domain layer
- Role bucket: `core`
- Domain bucket: `Queue`

## Contents

- Subfolders: None
- Files: `scheduler.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.
