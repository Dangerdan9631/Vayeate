# Quickstart: Validate Bulk Template Mapping Assignments

## Prerequisites

- Install project dependencies.
- Use a template with at least two groups, two color variables, two contrast
  variables, mappings across multiple token types, and one semantic variant.
- Keep one non-latest template version available to verify read-only behavior.

## Automated validation

Run focused policy and renderer tests first, followed by routing, undo, and
architecture coverage:

```powershell
npx vitest run src/domain/operations/template-operations/mappings
npx vitest run src/app/template/template-flow-routing.test.ts
npx vitest run src/app/template/template-renderer-workflows.test.tsx
npx vitest run src/domain/operations/undo-operations
npx vitest run test/architecture
npm run lint
```

Expected result: all commands pass. Policy tests prove complete target
resolution, assignment, orphan removal, no-op handling, and invalid-reference
atomicity without real UI or persistence details.

## Manual workflow

1. Open the latest version of a template and select mappings from different
   groups and token types, including a semantic variant.
2. Confirm selected rows and the total selected count remain visible and
   accurate.
3. Filter or collapse the list so at least one selected row is hidden. Confirm
   the selected count does not change.
4. Assign a group in the bulk controls. Confirm every selected mapping changes
   and every unselected mapping remains unchanged.
5. Repeat for color and contrast variables, including clearing each assignment.
6. Undo once and confirm every mapping returns to its individual prior value.
   Redo once and confirm the complete bulk result returns.
7. Clear selection and confirm bulk controls become unavailable.
8. Change templates and confirm the previous selection is gone.
9. Open a non-latest template version and confirm mappings cannot be selected
   for bulk mutation.

## Failure and boundary validation

- Queue two bulk assignments rapidly and verify they complete in order against
  current state.
- Remove a selected mapping through an earlier queued action and verify the stale
  identity is discarded without affecting remaining valid targets.
- Submit an outdated or invalid variable reference in a policy/controller test
  and verify no mapping, persistence call, or undo entry occurs.
- Select an orphan mapping, clear color in a bulk action, and verify it is removed
  atomically with the other selected changes.
- Assign a value already held by every target and verify no new template version,
  save, or undo entry is created.

## Scale check

Use a fixture containing at least 500 mappings. Select at least 100 mappings,
change filters, and perform one assignment. Verify selection feedback remains
responsive and the completed result includes all 100 targets.
