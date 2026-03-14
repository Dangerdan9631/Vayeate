# Directive update report: operations vs controllers composition

## User request

- `clearPersistedUndo` should be invoked from the load application **controller** (not from inside another operation).
- Operations are fine-grained and single responsibility; an operation must not call another operation.
- Controllers compose multiple operations.

## Code changes (already applied)

- **app-operations.ts**: Removed `loadApplication` and `unloadApplication`; kept only `clearPersistedUndo()`. No operation calls another operation.
- **app-controller.ts**: `loadApplication(setState)` and `unloadApplication(setState)` now invoke `clearPersistedUndo()` directly (controller composes the operation).
- **app-operations.test.ts**: Updated to test `clearPersistedUndo` with mocked `undoManagerV2` (removed tests for deleted ops).
- **app-controller.test.ts**: Test descriptions updated to "composes operations".

## Durable instruction updates (applied)

| File | Change | Reason |
|------|--------|--------|
| `.cursor/rules/vayeate-theme-studio-operations.mdc` | Added bullet: "No operation calls another operation"; only controllers compose (e.g. load application controller invokes `clearPersistedUndo`). | Project-wide constraint; operations rule is the right place. |
| `.cursor/rules/vayeate-theme-studio-architecture.mdc` | Clarified that only controllers compose operations; operations do not call other operations. | Aligns architecture with operations rule. |
| `.cursor/skills/add-or-modify-operation/SKILL.md` | In step 1, added: "Do not implement an operation that calls another operation; only controllers compose multiple operations." | Procedure trigger; skill is used when adding/modifying operations. |

## Not changed

- **AGENTS.md**: No routing change; existing "which file to read first" and skills index already point to operations and architecture rules.
- **New rule**: Not created; existing rules and skill were updated.
