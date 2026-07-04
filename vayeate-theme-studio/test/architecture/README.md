# Architecture

Test code that verifies architecture rules and shared test utilities.

## Placement

- Path: `test/architecture`
- Layer: Test support

## Contents

- Subfolders: None
- Files: `architecture.test.ts`, `component-workflow-compliance.test.ts`, `layer-boundaries.test.ts`, `undo-controller-coverage.test.ts`

## Rules

- Keep only architecture tests under test/architecture and helpers used by those tests under test/utils.
- Do not add renderer or domain unit tests here unless the repository test policy changes.

See the repository root AGENTS.md for the complete architecture and mutation-flow rules.

