# Plan: Controller Logic Extraction Refactor

Controllers in `vayeate-theme-studio/src/domain/controllers/` contain three categories of violations found across ~60 functions. The work is organized into 5 phases.

---

## TL;DR
Controllers perform inline object spreading, array filter/map, Set manipulation, ID generation, and multi-condition guards. All of this needs to move to operations (entity transforms), validations (business-rule guards), or domain/utils (pure computations).

---

## Decisions
- **Entity transform destination**: `domain/operations/` (pure files, no state params, imported with `Op` alias)
- **Validation scope**: All non-trivial guards encoding domain intent (not simple null checks)
- **`create*WithParams`**: Moved to `test/helpers/` only; removed from controller index exports

---

## Phase 1 — Extract pure computation helpers to `domain/utils/`

These are stateless, pure functions that currently live in controller shared-flows or controller list files.

**Steps:**

1. Create `domain/utils/stack-id.ts` — move `catalogStackId`, `templateStackId`, `themeStackId` here; update imports in controller index files and all call sites
2. Extend `domain/utils/version.ts` — add `findNearestVersionRef<T extends {name,version}>(refs, deletedName, deletedVersion): T | null`, absorbing the filter/sort/lower/higher/ternary pattern repeated identically in `deleteCatalogVersion`, `deleteTemplateVersion`, `deleteThemeVersion`
3. Extend `domain/utils/color.ts` — add `normalizeHexSafe(hex): string | null` (null-returning variant, absorbing `normalizeHexForPalette` and `normalizeHexVar` from theme-controller/shared-flows.ts which are identical)
4. Create `domain/utils/theme-assignment-utils.ts` — move `applyHueToAssignmentsFiltered` from `theme-controller/shared-flows.ts`
5. Create `domain/utils/contrast-utils.ts` — move `parseContrastValue` and `updateContrastAssignment` from `theme-controller/shared-flows.ts`
6. Create `domain/utils/template-utils.ts` — move `catalogVersionsByNameFromRefs`, `groupNamesInUseFromTemplate`, `referencedColorVarKeysFromTemplate`, `referencedContrastVarKeysFromTemplate` from `template-controller/shared-flows.ts`
7. Trim `shared-flows.ts` files to remove the migrated functions; keep orchestration flows (`refreshRefsAndSelect`)

> **Note before merging `normalizeHexForPalette` / `normalizeHexVar`:** Confirm they are truly identical in behavior — a subtle difference going unnoticed would be a silent regression.

---

## Phase 2 — Create domain validations

All non-trivial guards encoding business intent, per domain.

**Steps:** *(parallel sub-tasks per domain)*

8. Create `domain/validations/catalog-validations/` — start with `canLockCatalog(catalog): boolean` (`!!catalog && catalog.type === 'manual' && !catalog.locked`); audit remaining catalog controller guards for similar domain rules
9. Create `domain/validations/template-validations/` — audit all template controllers for multi-condition guards
10. Create `domain/validations/theme-validations/` — audit all theme controllers for multi-condition guards
11. Update `domain/validations/index.ts` to re-export all new validation families

---

## Phase 3 — Extract entity transforms to `domain/operations/`

Pure functions (no state params) in the appropriate operations subdirectory, imported with `Op` alias in controllers to avoid name collisions.

**Steps:** *(grouped by domain)*

12. **Catalog — details:** new `lockCatalog(catalog): Catalog` and `revertCatalog(snapshot, newVersion): Catalog` in `catalog-operations/catalog-details/`
13. **Catalog — sources:** new `addSource`, `removeSource`, `updateSourceUrl`, `updateSourceType`, `updateSourceTokenType` in `catalog-operations/sources/` — each takes a Catalog + arg, returns updated Catalog
14. **Catalog — tokens:** new `addTokenToCatalog`, `removeTokenFromCatalog`, `updateTokenKeyInCatalog`, `mergeSemanticSelectorsIntoCatalog`, `deduplicateBulkTokens` in `catalog-operations/tokens/` — absorbs the complex logic in `bulkAddTokens`, `addNewToken`, `removeToken`, `updateTokenKey`
15. **Template — base:** new `bumpTemplateVersionForEdit(template): Template` in `template-operations/` (absorbs `getBaseForEdit` from template shared-flows)
16. **Template — groups/mappings/variables:** new operation files for each logical mutation (`addGroup`, `removeGroup`, `removeMapping`, `setMappingColorRef`, `setMappingContrastRef`, `setMappingGroupRef`, `addColorVariable`, `removeColorVariable`, `addContrastVariable`, `removeContrastVariable`, `updateContrastComparisonSource`, `updateVariableGroupRef`) — each pure, entity-in/entity-out

    > **Note:** `setMappingGroupRef` has a try-catch around `parseSemanticSelector` — confirm the exception handling behavior is preserved when extracting to an operation.

17. **Template — semantic variants:** new `generateSemanticVariantKey(type): string` (absorbs `Date.now() + Math.random()` ID generation) and `applySemanticTokenSets(base, modifiers, languages)` (absorbs Set dedup/sort pattern repeated in `addSemanticVariant` and `updateSemanticVariantKey`)
18. **Theme — color/contrast variable assignments:** new operation per setter: `setColorAssignmentDark`, `setColorAssignmentLight`, `setColorAssignmentTarget`, `setColorAssignmentUseDarkForLight`, and equivalents for contrast (`setContrastAssignmentUseDarkForLight`, `setContrastAssignmentValue`, etc.) — each takes `assignments[]` + args, returns new array
19. **Theme — palette/selection:** new `computeClampedK(value): number`, `toggleGroupInSet(currentSet, id, checked): string[]`, `toggleRefsInSet(currentSet, refs, checked): string[]` operations for palette cluster and swatch group toggle logic
20. **Theme — variables selection:** new `computeVariableSelectionByGroup`, `computeVariableSelectionByType`, `toggleVariableRef` operations — absorb the Set construction + forEach logic in `setVariablesSelectByGroup`, `setVariablesSelectByType`, `toggleVariableSelection`
21. **Theme — selectThemeByName:** new `findBestVersionRef(refs, name)` operation absorbing the `.filter().reduce()` pattern

---

## Phase 4 — Clean up controllers

With utilities, validations, and operations in place, update every flagged controller:

22. Replace inline guards with validation function calls
23. Replace every inline object spread / array manipulation with an operation call (using `Op` alias on import to avoid naming conflicts)
24. Verify each controller body adheres to: read state → validate → call op → call op with prior result

Key files to update:
- `catalog-controller/catalog-details/lockCatalog.ts`, `revertCatalogToVersion.ts`
- `catalog-controller/catalog-list/deleteCatalogVersion.ts`
- `template-controller/template-list/deleteTemplateVersion.ts`
- `theme-controller/theme-list/deleteThemeVersion.ts` *(all three use new `findNearestVersionRef`)*
- All `sources/`, `tokens/`, `groups/`, `mappings/`, `variables/`, `palette/`, `variables-color/`, `variables-contrast/` controller files across all domains

---

## Phase 5 — Relocate factory functions to test helpers

25. Move `createCatalogWithParams` → new `test/helpers/catalog-helpers.ts`
26. Move `createTemplateWithParams` → `test/helpers/template-helpers.ts`
27. Move `createThemeWithParams` → `test/helpers/theme-helpers.ts`
28. Remove from controller index exports (`catalog-controller/index.ts`, `template-controller/index.ts`, `theme-controller/index.ts`)
29. Update imports in `catalog-controller.test.ts`, `template-controller.test.ts`, `theme-controller.test.ts`

---

## Verification
1. `npm run test` passes with no regressions
2. `npm run build` produces no TypeScript errors
3. Final review: no controller file body contains object spreading, array `.map/.filter/.reduce`, Set construction, Math operations, or string template generation

---

## Further considerations
1. The three `shared-flows.ts` files in template/theme/catalog controllers still need a pass after Phase 1 removes the utility functions — confirm only orchestration flows remain, or move the remaining helpers into individual controller files where used.
2. `normalizeHexForPalette` vs `normalizeHexVar` appear identical in logic — confirm before merging into a single `normalizeHexSafe` to avoid subtle behavioral difference going unnoticed.
3. The `setMappingGroupRef` controller contains a try-catch around `parseSemanticSelector` — this exception handling pattern should be evaluated when extracting to an operation to ensure error handling behavior is preserved.
