# Catalog

Pre-mutation validations for the Catalog business domain.

## Placement

- Path: `src/domain/validations/Catalog`
- Layer: Domain layer
- Role bucket: `validations`
- Domain bucket: `Catalog`

## Contents

- Subfolders: `catalog`
- Files: None

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

