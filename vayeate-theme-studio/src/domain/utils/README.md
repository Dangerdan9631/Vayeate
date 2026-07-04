# Utils

Files related to Utils.

## Placement

- Path: `src/domain/utils`
- Layer: Domain layer
- Role bucket: `utils`

## Contents

- Subfolders: `Catalog`, `Common`, `Template`, `Theme`
- Files: None

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

