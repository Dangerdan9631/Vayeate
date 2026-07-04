# Core

Files related to Core.

## Placement

- Path: `src/domain/core`
- Layer: Domain layer
- Role bucket: `core`

## Contents

- Subfolders: `Common`
- Files: None

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

