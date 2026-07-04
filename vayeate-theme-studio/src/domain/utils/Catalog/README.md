# Catalog

Pure domain helpers for the Catalog business domain.

## Placement

- Path: `src/domain/utils/Catalog`
- Layer: Domain layer
- Role bucket: `utils`
- Domain bucket: `Catalog`

## Contents

- Subfolders: None
- Files: `catalog-stack-id.ts`, `catalog-versions-by-name-from-refs.ts`, `template-catalog-merge.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

