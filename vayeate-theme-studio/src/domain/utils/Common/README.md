# Common

Pure domain helpers for the Common business domain.

## Placement

- Path: `src/domain/utils/Common`
- Layer: Domain layer
- Role bucket: `utils`
- Domain bucket: `Common`

## Contents

- Subfolders: None
- Files: `compare-versions.ts`, `compute-orphan-keys.ts`, `entity-refs-changed.ts`, `find-best-version-ref.ts`, `find-nearest-version-ref.ts`, `logger.ts`, `next-patch-version.ts`, `parse-semver.ts`, `style-assignment-utils.ts`

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

