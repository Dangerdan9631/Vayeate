# Plan: Vayeate Theme Studio — Further Architecture Cleanup

## Original Plan Audit Summary

| Phase | Status | Remaining Issues |
|-------|--------|-----------------|
| 1: Handler Extraction | **100% Complete** | — |
| 2: Action Cleanup | **~95%** | 5 actions still have `checked?: boolean` optional field |
| 3: Controller/Op Boundary | **~95%** | 4 controllers import `get*RefsFromStore()` directly from `domain/state/` |
| 4: Undo Infrastructure | **100% Complete** (full undo deferred as planned) | — |
| 5: Form State Centralization | **~95%** | Component-local layout state is intentionally local |
| 6: ts-arch Tests | **100% Complete** | All 32 boundary rules enforced |
| 7: Documentation | **100% Complete** | All 14 files updated |

## New Cleanup Plan

**TL;DR**: Fix remaining Phase 2/3 violations, encapsulate all `window.electronAPI` access behind gateway services, organize 130+ controller files and 67+ operation files into card-aligned subdirectories, add missing operation tests, and update ts-arch + docs.

---

### Phase A: Finish Phase 2/3 Violations

**Goal:** Zero optional-field branching in actions. Zero direct `domain/state/` imports in controllers.

**Steps**

1. Make `checked` required in all 5 action types in `action-types.ts`:
   - `TEMPLATE_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE` (line 89)
   - `THEME_DETAILS_CATALOG_CHECKBOX_ON_TOGGLE` (line 142)
   - `THEME_PALETTE_APPLY_TO_DARK_CHECKBOX_ON_TOGGLE` (line 144)
   - `THEME_PALETTE_APPLY_TO_LIGHT_CHECKBOX_ON_TOGGLE` (line 145)
   - `THEME_VARIABLES_VARIABLE_SELECTION_CHECKBOX_ON_TOGGLE` (line 179)
   Update dispatching components to always pass `checked`.

2. Create operation wrappers for `getThemeRefsFromStore()` and `getCatalogRefsFromStore()`, or accept refs as controller params passed by the handler.
   - `theme-controller/deleteThemeVersion.ts` — uses `getThemeRefsFromStore`
   - `theme-controller/selectThemeByName.ts` — uses `getThemeRefsFromStore`
   - `template-controller/toggleCatalog.ts` — uses `getCatalogRefsFromStore`
   - `template-controller/updateAllCatalogs.ts` — uses `getCatalogRefsFromStore`

**Relevant files**
- `vayeate-theme-studio/src/app/actions/action-types.ts` — make `checked` required
- Components that dispatch the 5 checkbox actions
- 4 controller files listed above — remove direct state imports

**Verification**
- `grep -r "checked?" src/app/actions/action-types.ts` returns 0 matches
- `grep -r "getThemeRefsFromStore\|getCatalogRefsFromStore" src/domain/controllers/` returns 0 matches
- All tests pass

---

### Phase B: IPC Encapsulation

**Goal:** `window.electronAPI` appears ONLY in `gateway/services/` and `main.tsx` (entry point). Zero usages in `domain/` or `app/ui/`.

Found 3 violations outside the gateway layer:

**Steps**

1. **Logger transport** (*depends on nothing*) — Extract IPC call from `domain/utils/logger.ts` into an injectable transport.
   - Create `gateway/services/log-service.ts` with a `sendLog(level, tag, args)` function.
   - Modify `logger.ts` to accept a pluggable transport (default: console-only; in `main.tsx` initialization, wire it to the gateway log service).
   - This removes the domain → electronAPI dependency.

2. **Eyedropper service** (*depends on nothing*) — Extract IPC from `app/ui/utils/eyedropper.ts`.
   - Create `gateway/services/eyedropper-service.ts` wrapping `eyedropperGetScreenSourcesWithBounds`.
   - Update `eyedropper.ts` to import from the gateway service.

3. **Window event subscriptions** (*depends on nothing*) — Extract IPC from `AppContext.tsx`.
   - Extend existing `gateway/services/window-service.ts` with `onWindowState`, `onWindowResize`, `onWindowMove` subscription methods.
   - Update AppContext to use the window service instead of `window.electronAPI` directly.

4. **main.tsx log listener** — The `window.electronAPI?.onMainLog` in `main.tsx` is acceptable (entry point), but consider moving to log-service for consistency.

**Relevant files**
- `vayeate-theme-studio/src/domain/utils/logger.ts` — remove `window.electronAPI` call
- `vayeate-theme-studio/src/app/ui/utils/eyedropper.ts` — extract to service
- `vayeate-theme-studio/src/app/ui/context/AppContext.tsx` — use window-service
- `vayeate-theme-studio/src/gateway/services/window-service.ts` — extend
- New: `gateway/services/log-service.ts`, `gateway/services/eyedropper-service.ts`

**Verification**
- `grep -r "window.electronAPI" src/` matches ONLY in `gateway/services/` and `main.tsx`
- Add ts-arch rule: `domain/utils/` must not depend on `gateway/`
- Add ts-arch rule: `app/ui/` must not depend on `gateway/services/` directly (enforces eyedropper fix) — OR update existing rules if they already cover this
- All tests pass

---

### Phase C: Controller Subdirectory Organization

**Goal:** Organize 130+ controller files and 67+ operation files into card-aligned subdirectories. Keep one function per file. Add a barrel `index.ts` per subdirectory.

**Steps**

1. **Theme controller** (62 files → 11 subdirectories) — *parallel with steps 2-3*

   | Subdirectory | Files | Maps to UI |
   |---|---|---|
   | `theme-list/` | loadThemeRefs, selectThemeAndLoad, selectThemeByName, openThemeCreateDialog, closeThemeCreateDialog, createTheme, createThemeWithParams, deleteThemeVersion, setThemeCreateFormName, themeStackId, theme-save-state | ThemesCard, CreateThemeDialog |
   | `theme-details/` | setThemeTemplate, setThemeTemplateToggle, setThemeTemplateVersionOnly, generateTheme, incrementThemeVersion, restoreThemeState, persistCurrentTheme, saveTheme, clearThemeSaveError, setThemePreviewTokenRef | ThemeDetailsCard |
   | `palette/` | setApplyPaletteToDark, setApplyPaletteToLight, setPaletteFullSelection, setPaletteSwatchGroupSelection, setPalettePrimarySwatch, setPaletteMemberSwatch, setPaletteClusterCountK, setPaletteClusterCountKPreview, setPaletteClusterGroupToggled | ThemePaletteCard |
   | `palette-color-assign/` | setAssignColorDraftText, commitAssignColorText, applyAssignColorDraft, assignColorFromPicker, setAssignColorPreview | ThemePaletteCard (color assign workflow) |
   | `palette-hue/` | setThemeHueReferenceHex, setThemeHueAdjustment, recenterHueReference | ThemePaletteCard (hue controls) |
   | `variables/` | setThemeVariableDraftText, setVariablesSelectAll, setVariablesSelectByType, setVariablesSelectByGroup, toggleVariableSelection, setThemeVariablesSearchText | ThemeVariablesCard (selection/filter) |
   | `variables-color/` | setColorVariableDark, setColorVariableLight, setColorVariableFromHex, setColorVariableFromHexPreview, setColorUseDarkForLight | ThemeVariablesCard (color editing) |
   | `variables-contrast/` | setContrastVariableDarkValue, setContrastVariableDarkMethod, setContrastVariableDarkMin, setContrastVariableDarkMax, setContrastUseDarkForLight, setContrastVariableLightValue, setContrastVariableLightMethod, setContrastVariableLightMin, setContrastVariableLightMax | ThemeVariablesCard (contrast editing) |
   | `previews/` | previewSampleButtonScroll, setPreviewSelectedSample, setPreviewVariableFilterText, setPreviewVariableSelection, clearPreviewVariableFilter | EditorPreviewsCard |
   | `pickers/` | setThemeOpenPickerContext, setThemePaneSelections | Pickers/popovers |
   | Root | `shared-flows.ts`, `theme-controller.test.ts`, `index.ts` | — |

2. **Template controller** (38 files → 9 subdirectories) — *parallel with steps 1, 3*

   | Subdirectory | Files | Maps to UI |
   |---|---|---|
   | `template-list/` | loadTemplatePage, loadTemplateRefs, openCreateDialog, closeCreateDialog, createTemplate, createTemplateWithParams, selectTemplateAndLoad, deleteTemplateVersion, setCreateFormName, templateStackId | TemplatesCard, dialogs |
   | `template-details/` | lockTemplate, updateAllCatalogs, toggleCatalog, changeCatalogVersion, saveTemplate, openTemplateCreateDialog, closeTemplateCreateDialog, restoreTemplateState | TemplateDetailsCard |
   | `mappings/` | setMappingSearchText, setMappingColorVariableFilter, setMappingContrastVariableFilter, setMappingGroupRef, setMappingColorRef, setMappingContrastRef, setMappingTokenGroupSelection, removeMapping | MappingsCard |
   | `mappings-semantic/` | addSemanticVariant, updateSemanticVariantKey | MappingsCard (semantic variants) |
   | `groups/` | addGroup, removeGroup, setTemplateAddGroupName | GroupsCard |
   | `variables/` | setVariablesSearchText, setTemplateAddVariableName, updateVariableGroupRef | VariablesCard (shared) |
   | `variables-color/` | addColorVariable, removeColorVariable | VariablesCard (color) |
   | `variables-contrast/` | addContrastVariable, removeContrastVariable, updateContrastComparisonSource | VariablesCard (contrast) |
   | Root | `shared-flows.ts`, `template-controller.test.ts`, `index.ts` | — |

3. **Catalog controller** (36 files → 6 subdirectories) — *parallel with steps 1-2*

   | Subdirectory | Files | Maps to UI |
   |---|---|---|
   | `catalog-list/` | loadCatalogRefs, loadCatalogsForDisplay, openCatalogCreateDialog, closeCatalogCreateDialog, createCatalog, createCatalogWithParams, selectCatalogAndLoad, deleteCatalogVersion, setCatalogCreateFormName, setCatalogCreateFormType, catalogStackId | CatalogsCard, dialogs |
   | `catalog-details/` | lockCatalog, saveCatalog, restoreCatalogState, revertCatalogToVersion, syncCatalog | CatalogDetailsCard |
   | `sources/` | updateSourceUrl, updateSourceTokenType, updateSourceType, removeSource, setCatalogNewSourceUrl, setCatalogNewSourceTokenType, setCatalogNewSourceType, addNewSource | CatalogDetailsCard (sources section) |
   | `tokens/` | setCatalogTokensSearchText, updateTokenKey, removeToken, setCatalogNewTokenKey, addNewToken | TokensCard |
   | `bulk-add/` | openBulkAddDialog, closeBulkAddDialog, setCatalogBulkAddText, bulkAddTokens | BulkAddDialog |
   | Root | `shared-flows.ts`, `catalog-controller.test.ts`, `index.ts` | — |

4. **Apply same pattern to operations directories** — mirror controller subdirectory structure where applicable. Operations may not map 1:1 since they're more granular, but grouping by domain concern (e.g., `theme-operations/palette/`, `theme-operations/variables/`) improves navigability.

5. **Update all barrel `index.ts` files** — group exports with section comments matching subdirectory names.

6. **Handler imports are unaffected** — handlers import from the `*-controller` barrel, which re-exports everything.

**Relevant files**
- All files in `domain/controllers/theme-controller/`, `template-controller/`, `catalog-controller/`
- All files in `domain/operations/theme-operations/`, `template-operations/`, `catalog-operations/`
- Barrel `index.ts` files in each directory

**Verification**
- All tests pass
- All ts-arch tests pass
- Build succeeds
- Every controller file is in a named subdirectory (only `shared-flows.ts`, test file, and `index.ts` remain at root of each controller directory)

---

### Phase D: Operation Test Coverage

**Goal:** Add unit tests for catalog-operations, template-operations, and theme-operations.

**Steps**

1. **Catalog operations tests** — Test the critical operations: `createCatalog`, `saveCatalog`, `loadCatalog`, `deleteCatalog`, `syncCatalog`, `loadCatalogRefs`. Mock gateway services.

2. **Template operations tests** — Test `createTemplate`, `saveTemplate`, `loadTemplate`, `deleteTemplate`, `loadTemplateRefs`, `refreshTemplateRefs`. Mock gateway services.

3. **Theme operations tests** — Test `createTheme`, `saveTheme`, `loadTheme`, `deleteTheme`, `generateTheme`, `loadThemeRefs`. Mock gateway services.

**Relevant files**
- New: `domain/operations/catalog-operations/catalog-operations.test.ts`
- New: `domain/operations/template-operations/template-operations.test.ts`
- New: `domain/operations/theme-operations/theme-operations.test.ts`
- Existing patterns in `domain/operations/undo-operations/undo-operations.test.ts` as reference template

**Verification**
- All new tests pass
- Each test file covers CRUD + ref-loading operations for its domain

---

### Phase E: ts-arch Updates + Documentation

**Goal:** Add new boundary rules for the IPC encapsulation, update docs to reflect subdirectory structure.

**Steps**

1. **ts-arch tests** — add rules:
   - `domain/utils/` must not depend on `gateway/` (enforces logger fix)
   - `app/ui/` must not depend on `gateway/services/` directly (enforces eyedropper fix) — OR verify the existing `app ≠ gateway` rule already covers this
   - Verify existing rules still pass after Phase C file moves

2. **Update barrel `index.ts` files** — add comment groupings for subdirectory sections.

3. **Update documentation**:
   - `agent-docs/architecture.md` — describe the subdirectory-per-card convention for controllers and operations
   - `agent-docs/conventions.md` — add naming convention: subdirectory name must match the UI card it serves
   - `AGENTS.md` — no routing table changes needed (existing routing to per-domain handlers is still correct)
   - `.cursor/rules/vayeate-theme-studio-architecture.mdc` — update with subdirectory patterns

4. **Fix stale comment** — `domain/state/ui-state.ts` has a comment "Persisted to localStorage" — update to "Persisted via config service".

**Verification**
- All ts-arch tests pass
- Documentation is consistent
- `npm run test` and `npm run build` pass

---

## Phase Execution Order

```
Phase A: Finish Violations ────────────┐
                                        │ (parallel)
Phase B: IPC Encapsulation ────────────┤
                                        │
Phase C: Subdirectory Org ─ after A,B ──┤
                                        │
Phase D: Operation Tests ─ after C ─────┤
                                        │
Phase E: ts-arch + Docs ─ after all ────┘
```

- Phases A and B can run in parallel
- Phase C depends on A+B (moved/renamed files should be in their final locations before reorganizing)
- Phase D depends on C (test files should live in the new subdirectory structure)
- Phase E runs last (documents the final state)

---

## Decisions

- **Keep one-function-per-file** — add a subdirectory layer aligned to UI cards for grouping
- **Mirror controller subdirs in operations** where logical grouping applies
- **Logger uses injectable transport** — no direct `window.electronAPI` in domain layer
- **Eyedropper extracted to gateway service** — UI utils import the service interface, not IPC directly
- **`checked` made required** in all 5 checkbox action types
- **Controller state access** — resolved by passing refs as params from the handler, or wrapping in read operations

## Scope Boundaries

**Included:**
- Fix remaining Phase 2/3 violations from original plan
- IPC encapsulation for logger, eyedropper, and window event subscriptions
- Controller + operation subdirectory reorganization
- Operation test coverage for catalog, template, theme domains
- ts-arch rule additions + documentation updates

**Excluded:**
- Full undo implementation (still deferred post-plan)
- New features or UI changes
- Domain business logic changes
- Root extension packaging
