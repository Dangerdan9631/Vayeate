# Template

Zustand state shapes and stores for the Template business domain.

## Placement

- Path: `src/domain/state/Template`
- Layer: Domain layer
- Role bucket: `state`
- Domain bucket: `Template`

## Contents

- Subfolders: `data`, `ui`
- Files: None

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

