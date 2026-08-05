# Domain

Business logic boundary. Code here owns operations, validations, stores, pure helpers, and shared domain primitives.

## Placement

- Path: `src/domain`
- Layer: Domain layer

## Contents

- Subfolders: `core`, `operations`, `state`, `utils`, `validations`
- Files: None

## Rules

- Keep business rules, validations, store state, and state mutation policy in the domain layer.
- Only operations mutate stores. Controllers and validations may read snapshots.
- Do not import React, Electron main-process APIs, or raw filesystem APIs here.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

