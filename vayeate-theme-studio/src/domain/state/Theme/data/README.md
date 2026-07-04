# Data

Zustand state shapes and stores for the Theme business domain.

## Placement

- Path: `src/domain/state/Theme/data`
- Layer: Domain layer
- Role bucket: `state`
- Domain bucket: `Theme`

## Contents

- Subfolders: None
- Files: `themes-state.ts`, `themes-store.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

