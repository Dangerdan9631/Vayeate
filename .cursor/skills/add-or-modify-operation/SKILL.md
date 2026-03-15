---
name: add-or-modify-operation
description: Add, update, or modify a vayeate-theme-studio operation following atomic, fine-grained, and coupled constraints.
---

# Add or Modify Theme Studio Operation

Use this skill when:
- the user or task asks to add, update, or modify a vayeate-theme-studio operation
- adding a new operation or a new operations file

## Prerequisites

Read before implementing:
- Operations rule (`.cursor/rules/vayeate-theme-studio-operations.mdc`) for atomicity, single/batch scope, and coupling
- Architecture rule (`.cursor/rules/vayeate-theme-studio-architecture.mdc`) for layer placement and controller usage

## What to do

1. **Decide scope and coupling**: Choose single-entity vs batch. Ensure all changes in the operation are inherently coupled (no partial execution). If two updates can be done independently, use two operations. Do not implement an operation that calls another operation; only controllers compose multiple operations.

2. **Add or edit the operation**: Place the operation in the appropriate file under `vayeate-theme-studio/src/domain/operations/`: `theme-operations.ts`, `catalog-operations.ts`, or `template-operations.ts`. If the change warrants a new domain, add a new `<domain>-operations.ts` and follow existing patterns (e.g. `SetState`, service calls).

3. **Export**: Export the new or updated function so controllers can import it.

4. **Use from controller only**: Operations are invoked only by controllers. Wire the operation in the relevant controller under `src/domain/controllers/`; do not call operations from UI or the processor directly.

5. **State updates**: If the operation produces a new `AppStateUpdate` type, add the corresponding reducer case in `vayeate-theme-studio/src/domain/state/app-state.ts`.

6. **Tests**: Add or update tests. Per the Test with Changes rule (`.cursor/rules/vayeate-theme-studio-test-with-changes.mdc`), operations are tested in `src/domain/operations/*.test.ts` or via controller tests that mock the operation. Prefer testing public behavior and outcomes.

## References

- Operations rule (`.cursor/rules/vayeate-theme-studio-operations.mdc`)
- Architecture rule (`.cursor/rules/vayeate-theme-studio-architecture.mdc`)
- Test with Changes rule (`.cursor/rules/vayeate-theme-studio-test-with-changes.mdc`)
