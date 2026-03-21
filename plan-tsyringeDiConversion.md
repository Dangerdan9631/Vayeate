# Plan: Convert All Operations and Controllers to tsyringe DI Classes

## Goal

Convert every exported function in `src/domain/operations/` and `src/domain/controllers/` to an `@injectable()` / `@singleton()` class that uses tsyringe constructor injection, following the patterns established in the already-converted files.

---

## Conversion Patterns

### State Injection Map

| Old function param | Inject this class | Method |
|---|---|---|
| `setState: SetState` (AppState) | `AppStateSetter` | `this.appStateSetter.apply(update)` |
| `setStoreState: SetStoreState` | `StoreStateSetter` | `this.storeStateSetter.apply(update)` |
| `getState: GetState` | `AppStateGetter` | `this.appStateGetter.current()` |
| `setUiState: SetUiState` | `UiStateSetter` | `this.uiStateSetter.apply(update)` |

### Decorator rules

- **Operations**: use `@injectable()`
- **Controllers**: use `@singleton()`

### Pattern A — Pure function operation (no side effects, no deps)

_Before:_
```typescript
export function bumpCatalogVersionForEdit(catalog: Catalog): Catalog {
  return catalog.locked
    ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
    : catalog;
}
```

_After:_
```typescript
import { injectable } from 'tsyringe';
import type { Catalog } from '../../../../model/schemas';
import { nextPatchVersion } from '../../../utils/version';

@injectable()
export class BumpCatalogVersionForEdit {
  execute(catalog: Catalog): Catalog {
    return catalog.locked
      ? { ...catalog, version: nextPatchVersion(catalog.version), locked: false }
      : catalog;
  }
}
```

---

### Pattern B — Operation that updates AppState (`setState: SetState`)

_Before:_
```typescript
import type { SetState } from '../types';

export function setCatalogCreateFormName(setState: SetState, value: string): void {
  setState({ type: 'SET_CATALOG_CREATE_FORM_NAME', value });
}
```

_After:_
```typescript
import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';

@injectable()
export class SetCatalogCreateFormName {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_CATALOG_CREATE_FORM_NAME', value });
  }
}
```

---

### Pattern C — Operation that updates StoreState (`setStoreState: SetStoreState`)

_Before:_
```typescript
export async function refreshCatalogRefs(setStoreState: SetStoreState): Promise<CatalogReference[]> {
  const refs = await catalogService.listCatalogs();
  setStoreState({ type: 'SET_STORE_CATALOG_ENTRIES', entries: ... });
  return refs;
}
```

_After:_
```typescript
import { injectable } from 'tsyringe';
import { StoreStateSetter } from '../../../state/store-state-setter';

@injectable()
export class RefreshCatalogRefs {
  constructor(private readonly storeStateSetter: StoreStateSetter) {}

  async execute(): Promise<CatalogReference[]> {
    const refs = await catalogService.listCatalogs();
    this.storeStateSetter.apply({ type: 'SET_STORE_CATALOG_ENTRIES', entries: ... });
    return refs;
  }
}
```

---

### Pattern D — Operation that reads AppState (`getState: GetState`)

_Before:_
```typescript
export async function lockCatalog(getState: GetState): Promise<void> {
  const { catalog } = getState().catalogsState;
  ...
}
```

_After:_
```typescript
import { injectable } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';

@injectable()
export class LockCatalog {
  constructor(private readonly appStateGetter: AppStateGetter) {}

  async execute(): Promise<void> {
    const { catalog } = this.appStateGetter.current().catalogsState;
    ...
  }
}
```

---

### Pattern E — Controller function → class (injects operation classes)

_Before:_
```typescript
export async function createCatalog(
  setState: SetState,
  setStoreState: SetStoreState,
  params: { name: string; type: 'manual' | 'remote' },
): Promise<void> {
  setState({ type: 'SET_IS_CREATING', value: true });
  setState({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
  try {
    const catalog = await createCatalogOperation(setState, params);
    await refreshCatalogRefs(setStoreState);
    setCatalog(setState, catalog);
    setSelectedRef(setState, { name: catalog.name, version: catalog.version });
    setCurrentUndoStackId(setState, catalogStackId(catalog.name, catalog.version));
  } finally {
    setState({ type: 'SET_IS_CREATING', value: false });
  }
}
```

_After:_
```typescript
import { singleton } from 'tsyringe';
import { CreateCatalog } from '../../../operations/catalog-operations';
import { RefreshCatalogRefs } from '../../../operations/catalog-operations';
import { SetCatalog } from '../../../operations/catalog-operations';
import { SetSelectedRef } from '../../../operations/catalog-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';
import { AppStateSetter } from '../../../state/app-state-setter';
import { catalogStackId } from '../../../utils/stack-id';

@singleton()
export class CreateCatalogController {
  constructor(
    private readonly appStateSetter: AppStateSetter,
    private readonly createCatalog: CreateCatalog,
    private readonly refreshCatalogRefs: RefreshCatalogRefs,
    private readonly setCatalog: SetCatalog,
    private readonly setSelectedRef: SetSelectedRef,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
  ) {}

  async run(params: { name: string; type: 'manual' | 'remote' }): Promise<void> {
    this.appStateSetter.apply({ type: 'SET_IS_CREATING', value: true });
    this.appStateSetter.apply({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
    try {
      const catalog = await this.createCatalog.execute(params);
      await this.refreshCatalogRefs.execute();
      this.setCatalog.execute(catalog);
      this.setSelectedRef.execute({ name: catalog.name, version: catalog.version });
      this.setCurrentUndoStackId.execute(catalogStackId(catalog.name, catalog.version));
    } finally {
      this.appStateSetter.apply({ type: 'SET_IS_CREATING', value: false });
    }
  }
}
```

---

### Pattern F — `shared-flows.ts` → injectable class

_Before_ (`catalog-controller/shared-flows.ts`):
```typescript
export async function refreshRefsAndSelect(
  setState: SetState,
  setStoreState: SetStoreState,
  selectName?: string,
  selectVersion?: string,
): Promise<void> { ... }
```

_After_ (`catalog-controller/shared-flows.ts`):
```typescript
import { injectable } from 'tsyringe';
import { RefreshCatalogRefs, SetSelectedRef, LoadCatalog } from '../../../operations/catalog-operations';

@injectable()
export class CatalogSharedFlows {
  constructor(
    private readonly refreshCatalogRefs: RefreshCatalogRefs,
    private readonly setSelectedRef: SetSelectedRef,
    private readonly loadCatalog: LoadCatalog,
  ) {}

  async refreshRefsAndSelect(selectName?: string, selectVersion?: string): Promise<void> { ... }
}
```

---

### Handler update pattern (after controllers are converted)

_Before_ (catalog-handler.ts):
```typescript
catalogController.setCatalogCreateFormName(setState, action.value);
await catalogController.createCatalog(setState, setStoreState, action.params);
```

_After_:
```typescript
container.resolve(catalogController.SetCatalogCreateFormNameController).run(action.value);
await container.resolve(catalogController.CreateCatalogController).run(action.params);
```

> **Note**: `HandlerDeps` (`setState`, `getState`, `setStoreState`) will become unused in handlers once all controllers are converted to classes. The handler function signature can be simplified afterward.

---

## Checklist

### A. App Handler Fix

- [x] `src/app/handlers/app-handler.ts`: add `await` before `container.resolve(tabController.SetActiveTabController).run(action.tabId)`

---

### B. Operations — Catalog (`src/domain/operations/catalog-operations/`)

#### bulk-add
- [x] `bulk-add/setCatalogBulkAddDialogOpen.ts` → `SetCatalogBulkAddDialogOpen`
- [x] `bulk-add/setCatalogBulkAddText.ts` → `SetCatalogBulkAddText`

#### catalog-details
- [x] `catalog-details/bump-catalog-version-for-edit.ts` → `BumpCatalogVersionForEdit`
- [x] `catalog-details/loadCatalog.ts` → `LoadCatalog`
- [x] `catalog-details/loadCatalogForDisplay.ts` → `LoadCatalogForDisplay`
- [x] `catalog-details/loadCatalogSnapshot.ts` → `LoadCatalogSnapshot`
- [x] `catalog-details/lock-catalog.ts` → `LockCatalog`
- [x] `catalog-details/lock-head-catalog-if-unlocked.ts` → `LockHeadCatalogIfUnlocked`
- [x] `catalog-details/revert-catalog.ts` → `RevertCatalog`
- [x] `catalog-details/saveCatalog.ts` → `SaveCatalog`
- [x] `catalog-details/setCatalog.ts` → `SetCatalog`
- [x] `catalog-details/syncCatalog.ts` → `SyncCatalog`

#### catalog-list
- [x] `catalog-list/createCatalog.ts` → `CreateCatalog`
- [x] `catalog-list/deleteCatalog.ts` → `DeleteCatalog`
- [x] `catalog-list/getCatalogRefs.ts` → `GetCatalogRefs`
- [x] `catalog-list/listCatalogRefs.ts` → `ListCatalogRefs`
- [x] `catalog-list/refreshCatalogRefs.ts` → `RefreshCatalogRefs`
- [x] `catalog-list/setCatalogCreateFormName.ts` → `SetCatalogCreateFormName`
- [x] `catalog-list/setCatalogCreateFormType.ts` → `SetCatalogCreateFormType`
- [x] `catalog-list/setCatalogRefs.ts` → `SetCatalogRefs`
- [x] `catalog-list/setSelectedRef.ts` → `SetSelectedRef`

#### sources
- [x] `sources/add-source-to-catalog.ts` → `AddSourceToCatalog`
- [x] `sources/remove-source-at-index.ts` → `RemoveSourceAtIndex`
- [x] `sources/setCatalogNewSourceTokenType.ts` → `SetCatalogNewSourceTokenType`
- [x] `sources/setCatalogNewSourceType.ts` → `SetCatalogNewSourceType`
- [x] `sources/setCatalogNewSourceUrl.ts` → `SetCatalogNewSourceUrl`
- [x] `sources/update-source-token-type-in-catalog.ts` → `UpdateSourceTokenTypeInCatalog`
- [x] `sources/update-source-type-in-catalog.ts` → `UpdateSourceTypeInCatalog`
- [x] `sources/update-source-url-in-catalog.ts` → `UpdateSourceUrlInCatalog`

#### tokens
- [x] `tokens/add-plain-token-to-catalog.ts` → `AddPlainTokenToCatalog`
- [x] `tokens/append-tokens-to-catalog.ts` → `AppendTokensToCatalog`
- [x] `tokens/deduplicate-bulk-tokens.ts` → `DeduplicateBulkTokens`
- [x] `tokens/merge-semantic-selectors-into-catalog.ts` → `MergeSemanticSelectorsIntoCatalog`
- [x] `tokens/remove-token-from-catalog.ts` → `RemoveTokenFromCatalog`
- [x] `tokens/setCatalogNewTokenKey.ts` → `SetCatalogNewTokenKey`
- [x] `tokens/setCatalogTokensSearchText.ts` → `SetCatalogTokensSearchText`
- [x] `tokens/update-token-key-in-catalog.ts` → `UpdateTokenKeyInCatalog`

#### types / index
- [x] `types.ts` — remove `SetState` export once no operation files import it; keep `CatalogPaneState` and `CatalogUndoPush` if still referenced by other code
- [x] `index.ts` — update all `export { functionName }` entries to `export { ClassName }` as each file is converted

---

### C. Operations — Template (`src/domain/operations/template-operations/`)

#### groups
- [x] `groups/add-group-to-template.ts` → `AddGroupToTemplate`
- [x] `groups/remove-group-from-template.ts` → `RemoveGroupFromTemplate`

#### mappings
- [x] `mappings/remove-mapping-from-template.ts` → `RemoveMappingFromTemplate`
- [x] `mappings/set-mapping-color-ref.ts` → `SetMappingColorRef`
- [x] `mappings/set-mapping-contrast-ref.ts` → `SetMappingContrastRef`
- [x] `mappings/set-mapping-group-ref.ts` → `SetMappingGroupRef`
- [x] `mappings/setTemplateMappingColorVariableFilter.ts` → `SetTemplateMappingColorVariableFilter`
- [x] `mappings/setTemplateMappingContrastVariableFilter.ts` → `SetTemplateMappingContrastVariableFilter`
- [x] `mappings/setTemplateMappingSearchText.ts` → `SetTemplateMappingSearchText`
- [x] `mappings/setTemplateMappingTokenGroupSelection.ts` → `SetTemplateMappingTokenGroupSelection`

#### mappings-semantic
- [x] `mappings-semantic/append-semantic-variant-to-template.ts` → `AppendSemanticVariantToTemplate`
- [x] `mappings-semantic/generate-semantic-variant-key.ts` → `GenerateSemanticVariantKey`
- [x] `mappings-semantic/merge-semantic-token-sets.ts` → `MergeSemanticTokenSets`
- [x] `mappings-semantic/update-semantic-variant-key-in-template.ts` → `UpdateSemanticVariantKeyInTemplate`

#### template-details
- [x] `template-details/bump-template-version-for-edit.ts` → `BumpTemplateVersionForEdit`
- [x] `template-details/loadTemplate.ts` → `LoadTemplate`
- [x] `template-details/loadTemplateSnapshot.ts` → `LoadTemplateSnapshot`
- [x] `template-details/lock-template.ts` → `LockTemplate`
- [x] `template-details/saveTemplate.ts` → `SaveTemplate`
- [x] `template-details/setTemplate.ts` → `SetTemplate`

#### template-list
- [x] `template-list/createTemplate.ts` → `CreateTemplate`
- [x] `template-list/deleteTemplate.ts` → `DeleteTemplate`
- [x] `template-list/refreshTemplateRefs.ts` → `RefreshTemplateRefs`
- [x] `template-list/setSelectedTemplateRef.ts` → `SetSelectedTemplateRef`
- [x] `template-list/setTemplateCreateFormName.ts` → `SetTemplateCreateFormName`
- [x] `template-list/setTemplateRefs.ts` → `SetTemplateRefs`

#### variables
- [x] `variables/setTemplateAddGroupName.ts` → `SetTemplateAddGroupName`
- [x] `variables/setTemplateAddVariableName.ts` → `SetTemplateAddVariableName`
- [x] `variables/setTemplateVariablesSearchText.ts` → `SetTemplateVariablesSearchText`
- [x] `variables/update-variable-group-ref.ts` → `UpdateVariableGroupRef`

#### variables-color
- [x] `variables-color/add-color-variable.ts` → `AddColorVariable`
- [x] `variables-color/remove-color-variable.ts` → `RemoveColorVariable`

#### variables-contrast
- [x] `variables-contrast/add-contrast-variable.ts` → `AddContrastVariable`
- [x] `variables-contrast/remove-contrast-variable.ts` → `RemoveContrastVariable`
- [x] `variables-contrast/update-contrast-comparison-source.ts` → `UpdateContrastComparisonSource`

#### types / index
- [x] `types.ts` — remove `SetState` export once unused; review remaining types
- [x] `index.ts` — update all `export { functionName }` entries to `export { ClassName }` as each file is converted

---

### D. Operations — Theme (`src/domain/operations/theme-operations/`) — remaining

#### palette-color-assign
- [x] `palette-color-assign/setAssignColorDraftText.ts` → `SetAssignColorDraftText`

#### pickers
- [x] `pickers/setThemeOpenPickerContext.ts` → `SetThemeOpenPickerContext`

#### previews
- [x] `previews/setThemePreviewSelectedSampleKey.ts` → `SetThemePreviewSelectedSampleKey`
- [x] `previews/setThemePreviewVariableFilterClear.ts` → `SetThemePreviewVariableFilterClear`
- [x] `previews/setThemePreviewVariableFilterText.ts` → `SetThemePreviewVariableFilterText`

#### theme-details
- [x] `theme-details/generateTheme.ts` → `GenerateTheme`
- [x] `theme-details/setGenerateResult.ts` → `SetGenerateResult`

#### theme-list
- [x] `theme-list/setThemeRefs.ts` → `SetThemeRefs`

#### variables
- [x] `variables/setThemeVariableDraftText.ts` → `SetThemeVariableDraftText`
- [x] `variables/setThemeVariablesSearchText.ts` → `SetThemeVariablesSearchText`

#### types / index
- [x] `types.ts` — remove `SetState` export once unused; keep `RestoreThemeStateParams` if still referenced
- [x] `index.ts` — update any remaining `export { functionName }` entries as files are converted

---

### E. Operations — Other types cleanup

- [x] `app-operations/types.ts` — remove `SetState` export once unused
- [x] `undo-operations/types.ts` — remove `SetState` / `GetState` exports once unused

---

### F. Controllers — Catalog (`src/domain/controllers/catalog-controller/`)

#### shared-flows
- [x] `shared-flows.ts` → `CatalogSharedFlows` class (`@injectable()`, method `refreshRefsAndSelect`)

#### bulk-add
- [x] `bulk-add/bulkAddTokens.ts` → `BulkAddTokensController`
- [x] `bulk-add/closeBulkAddDialog.ts` → `CloseBulkAddDialogController`
- [x] `bulk-add/openBulkAddDialog.ts` → `OpenBulkAddDialogController`
- [x] `bulk-add/setCatalogBulkAddText.ts` → `SetCatalogBulkAddTextController`

#### catalog-details
- [x] `catalog-details/lockCatalog.ts` → `LockCatalogController`
- [x] `catalog-details/restoreCatalogState.ts` → `RestoreCatalogStateController`
- [x] `catalog-details/revertCatalogToVersion.ts` → `RevertCatalogToVersionController`
- [x] `catalog-details/saveCatalog.ts` → `SaveCatalogController`
- [x] `catalog-details/syncCatalog.ts` → `SyncCatalogController`

#### catalog-list
- [x] `catalog-list/closeCatalogCreateDialog.ts` → `CloseCatalogCreateDialogController`
- [x] `catalog-list/createCatalog.ts` → `CreateCatalogController`
- [x] `catalog-list/deleteCatalogVersion.ts` → `DeleteCatalogVersionController`
- [x] `catalog-list/loadCatalogForDisplay.ts` → `LoadCatalogForDisplayController`
- [x] `catalog-list/loadCatalogsForDisplay.ts` → `LoadCatalogsForDisplayController`
- [x] `catalog-list/openCatalogCreateDialog.ts` → `OpenCatalogCreateDialogController`
- [x] `catalog-list/selectCatalogAndLoad.ts` → `SelectCatalogAndLoadController`
- [x] `catalog-list/setCatalogCreateFormName.ts` → `SetCatalogCreateFormNameController`
- [x] `catalog-list/setCatalogCreateFormType.ts` → `SetCatalogCreateFormTypeController`

#### sources
- [x] `sources/addNewSource.ts` → `AddNewSourceController`
- [x] `sources/removeSource.ts` → `RemoveSourceController`
- [x] `sources/setCatalogNewSourceTokenType.ts` → `SetCatalogNewSourceTokenTypeController`
- [x] `sources/setCatalogNewSourceType.ts` → `SetCatalogNewSourceTypeController`
- [x] `sources/setCatalogNewSourceUrl.ts` → `SetCatalogNewSourceUrlController`
- [x] `sources/updateSourceTokenType.ts` → `UpdateSourceTokenTypeController`
- [x] `sources/updateSourceType.ts` → `UpdateSourceTypeController`
- [x] `sources/updateSourceUrl.ts` → `UpdateSourceUrlController`

#### tokens
- [x] `tokens/addNewToken.ts` → `AddNewTokenController`
- [x] `tokens/removeToken.ts` → `RemoveTokenController`
- [x] `tokens/setCatalogNewTokenKey.ts` → `SetCatalogNewTokenKeyController`
- [x] `tokens/setCatalogTokensSearchText.ts` → `SetCatalogTokensSearchTextController`
- [x] `tokens/updateTokenKey.ts` → `UpdateTokenKeyController`

#### index
- [x] `index.ts` — update all `export { functionName }` entries to `export { ClassName }` as each file is converted

---

### G. Controllers — Template (`src/domain/controllers/template-controller/`)

#### shared-flows
- [x] `shared-flows.ts` → `TemplateSharedFlows` class (`@injectable()`, method `refreshRefsAndSelect`)

#### groups
- [x] `groups/addGroup.ts` → `AddGroupController`
- [x] `groups/addGroupAndClearInput.ts` → `AddGroupAndClearInputController`
- [x] `groups/removeGroup.ts` → `RemoveGroupController`
- [x] `groups/setTemplateAddGroupName.ts` → `SetTemplateAddGroupNameController`

#### mappings
- [x] `mappings/removeMapping.ts` → `RemoveMappingController`
- [x] `mappings/setMappingColorRef.ts` → `SetMappingColorRefController`
- [x] `mappings/setMappingColorVariableFilter.ts` → `SetMappingColorVariableFilterController`
- [x] `mappings/setMappingContrastRef.ts` → `SetMappingContrastRefController`
- [x] `mappings/setMappingContrastVariableFilter.ts` → `SetMappingContrastVariableFilterController`
- [x] `mappings/setMappingGroupRef.ts` → `SetMappingGroupRefController`
- [x] `mappings/setMappingSearchText.ts` → `SetMappingSearchTextController`
- [x] `mappings/setMappingTokenGroupSelection.ts` → `SetMappingTokenGroupSelectionController`

#### mappings-semantic
- [x] `mappings-semantic/addSemanticVariant.ts` → `AddSemanticVariantController`
- [x] `mappings-semantic/updateSemanticVariantKey.ts` → `UpdateSemanticVariantKeyController`

#### template-details
- [x] `template-details/changeCatalogVersion.ts` → `ChangeCatalogVersionController`
- [x] `template-details/closeTemplateCreateDialog.ts` → `CloseTemplateCreateDialogController`
- [x] `template-details/lockTemplate.ts` → `LockTemplateController`
- [x] `template-details/openTemplateCreateDialog.ts` → `OpenTemplateCreateDialogController`
- [x] `template-details/restoreTemplateState.ts` → `RestoreTemplateStateController`
- [x] `template-details/saveTemplate.ts` → `SaveTemplateController`
- [x] `template-details/toggleCatalog.ts` → `ToggleCatalogController`
- [x] `template-details/updateAllCatalogs.ts` → `UpdateAllCatalogsController`

#### template-list
- [x] `template-list/closeCreateDialog.ts` → `CloseCreateDialogController`
- [x] `template-list/createTemplate.ts` → `CreateTemplateController`
- [x] `template-list/deleteTemplateVersion.ts` → `DeleteTemplateVersionController`
- [x] `template-list/openCreateDialog.ts` → `OpenCreateDialogController`
- [x] `template-list/selectTemplateAndLoad.ts` → `SelectTemplateAndLoadController`
- [x] `template-list/setCreateFormName.ts` → `SetCreateFormNameController`

#### variables
- [x] `variables/addVariable.ts` → `AddVariableController`
- [x] `variables/removeVariable.ts` → `RemoveVariableController`
- [x] `variables/setTemplateAddVariableName.ts` → `SetTemplateAddVariableNameController`
- [x] `variables/setVariablesSearchText.ts` → `SetVariablesSearchTextController`
- [x] `variables/updateVariableGroupRef.ts` → `UpdateVariableGroupRefController`

#### variables-color
- [x] `variables-color/addColorVariable.ts` → `AddColorVariableController`
- [x] `variables-color/removeColorVariable.ts` → `RemoveColorVariableController`

#### variables-contrast
- [x] `variables-contrast/addContrastVariable.ts` → `AddContrastVariableController`
- [x] `variables-contrast/removeContrastVariable.ts` → `RemoveContrastVariableController`
- [x] `variables-contrast/updateContrastComparisonSource.ts` → `UpdateContrastComparisonSourceController`

#### index
- [x] `index.ts` — update all `export { functionName }` entries to `export { ClassName }` as each file is converted

---

### H. Controllers — Theme (`src/domain/controllers/theme-controller/`) — remaining

#### palette-color-assign
- [ ] `palette-color-assign/applyAssignColorDraft.ts` → `ApplyAssignColorDraftController`
- [ ] `palette-color-assign/assignColorFromPicker.ts` → `AssignColorFromPickerController`
- [ ] `palette-color-assign/commitAssignColorText.ts` → `CommitAssignColorTextController`
- [ ] `palette-color-assign/setAssignColorDraftText.ts` → `SetAssignColorDraftTextController`
- [ ] `palette-color-assign/setAssignColorPreview.ts` → `SetAssignColorPreviewController`

#### palette-hue
- [ ] `palette-hue/commitHueReferenceColor.ts` → `CommitHueReferenceColorController`
- [ ] `palette-hue/recenterHueReference.ts` → `RecenterHueReferenceController`
- [ ] `palette-hue/setThemeHueAdjustment.ts` → `SetThemeHueAdjustmentController`
- [ ] `palette-hue/setThemeHueReferenceHex.ts` → `SetThemeHueReferenceHexController`

#### palette
- [ ] `palette/handleMemberSwatchRightClick.ts` → `HandleMemberSwatchRightClickController`
- [ ] `palette/setApplyPaletteToDark.ts` → `SetApplyPaletteToDarkController`
- [ ] `palette/setApplyPaletteToLight.ts` → `SetApplyPaletteToLightController`
- [ ] `palette/setPaletteClusterCountK.ts` → `SetPaletteClusterCountKController`
- [ ] `palette/setPaletteClusterCountKPreview.ts` → `SetPaletteClusterCountKPreviewController`
- [ ] `palette/setPaletteClusterGroupToggled.ts` → `SetPaletteClusterGroupToggledController`
- [ ] `palette/setPaletteFullSelection.ts` → `SetPaletteFullSelectionController`
- [ ] `palette/setPaletteMemberSwatch.ts` → `SetPaletteMemberSwatchController`
- [ ] `palette/setPalettePrimarySwatch.ts` → `SetPalettePrimarySwatchController`
- [ ] `palette/setPaletteSwatchGroupSelection.ts` → `SetPaletteSwatchGroupSelectionController`

#### pickers
- [ ] `pickers/setThemeOpenPickerContext.ts` → `SetThemeOpenPickerContextController`
- [ ] `pickers/setThemePaneSelections.ts` → `SetThemePaneSelectionsController`

#### previews
- [ ] `previews/clearPreviewVariableFilter.ts` → `ClearPreviewVariableFilterController`
- [ ] `previews/previewSampleButtonScroll.ts` → `PreviewSampleButtonScrollController`
- [ ] `previews/setPreviewSelectedSample.ts` → `SetPreviewSelectedSampleController`
- [ ] `previews/setPreviewVariableFilterText.ts` → `SetPreviewVariableFilterTextController`
- [ ] `previews/setPreviewVariableSelection.ts` → `SetPreviewVariableSelectionController`

#### theme-details
- [ ] `theme-details/clearThemeSaveError.ts` → `ClearThemeSaveErrorController`
- [ ] `theme-details/generateTheme.ts` → `GenerateThemeController`
- [ ] `theme-details/persistCurrentTheme.ts` → `PersistCurrentThemeController`
- [ ] `theme-details/saveTheme.ts` → `SaveThemeController`
- [ ] `theme-details/setThemePreviewTokenRef.ts` → `SetThemePreviewTokenRefController`
- [ ] `theme-details/setThemeTemplate.ts` → `SetThemeTemplateController`
- [ ] `theme-details/setThemeTemplateToggle.ts` → `SetThemeTemplateToggleController`
- [ ] `theme-details/setThemeTemplateVersionOnly.ts` → `SetThemeTemplateVersionOnlyController`

#### theme-list
- [ ] `theme-list/closeThemeCreateDialog.ts` → `CloseThemeCreateDialogController`
- [ ] `theme-list/openThemeCreateDialog.ts` → `OpenThemeCreateDialogController`
- [ ] `theme-list/selectThemeAndLoad.ts` → `SelectThemeAndLoadController`
- [ ] `theme-list/selectThemeByName.ts` → `SelectThemeByNameController`
- [ ] `theme-list/setThemeCreateFormName.ts` → `SetThemeCreateFormNameController`
- [ ] `theme-list/theme-save-state.ts` → review: convert or inline if it is a utility module, not a standalone controller

#### variables
- [ ] `variables/setThemeVariableDraftText.ts` → `SetThemeVariableDraftTextController`
- [ ] `variables/setThemeVariablesSearchText.ts` → `SetThemeVariablesSearchTextController`
- [ ] `variables/setVariablesSelectAll.ts` → `SetVariablesSelectAllController`
- [ ] `variables/setVariablesSelectByGroup.ts` → `SetVariablesSelectByGroupController`
- [ ] `variables/setVariablesSelectByType.ts` → `SetVariablesSelectByTypeController`
- [ ] `variables/toggleVariableSelection.ts` → `ToggleVariableSelectionController`

#### variables-color
- [ ] `variables-color/setColorUseDarkForLight.ts` → `SetColorUseDarkForLightController`
- [ ] `variables-color/setColorVariableDark.ts` → `SetColorVariableDarkController`
- [ ] `variables-color/setColorVariableFromHex.ts` → `SetColorVariableFromHexController`
- [ ] `variables-color/setColorVariableFromHexPreview.ts` → `SetColorVariableFromHexPreviewController`
- [ ] `variables-color/setColorVariableLight.ts` → `SetColorVariableLightController`

#### variables-contrast
- [ ] `variables-contrast/setContrastUseDarkForLight.ts` → `SetContrastUseDarkForLightController`
- [ ] `variables-contrast/setContrastVariableDarkMax.ts` → `SetContrastVariableDarkMaxController`
- [ ] `variables-contrast/setContrastVariableDarkMethod.ts` → `SetContrastVariableDarkMethodController`
- [ ] `variables-contrast/setContrastVariableDarkMin.ts` → `SetContrastVariableDarkMinController`
- [ ] `variables-contrast/setContrastVariableDarkValue.ts` → `SetContrastVariableDarkValueController`
- [ ] `variables-contrast/setContrastVariableLightMax.ts` → `SetContrastVariableLightMaxController`
- [ ] `variables-contrast/setContrastVariableLightMethod.ts` → `SetContrastVariableLightMethodController`
- [ ] `variables-contrast/setContrastVariableLightMin.ts` → `SetContrastVariableLightMinController`
- [ ] `variables-contrast/setContrastVariableLightValue.ts` → `SetContrastVariableLightValueController`

#### index
- [ ] `index.ts` — update all `export { functionName }` entries to `export { ClassName }` as each file is converted

---

### I. Handler Updates

These handler files pass `setState`/`setStoreState` directly to controller functions. Once the corresponding controllers are converted to classes, each call site must be changed to `container.resolve(XController).run(...)`.

- [x] `src/app/handlers/catalog-handler.ts` — update all non-class call sites after catalog controllers are converted
- [x] `src/app/handlers/template-handler.ts` — update all non-class call sites after template controllers are converted
- [ ] `src/app/handlers/theme-handler.ts` — update all non-class call sites after theme controllers are converted

> After all handlers are updated, `HandlerDeps` (`setState`, `getState`, `setStoreState`, `setUiState`) may be unused in catalog/template/theme handlers and can be removed from their signatures.

---

### J. Validation

- [ ] `npm run test` passes with exit code 0
- [ ] `npm run build` passes with exit code 0

---

## Already Converted (reference)

The following files have already been converted and serve as the canonical patterns:

**Operations:**
- `app-operations/saveColorScheme.ts` → `SaveColorScheme` (`@singleton()`, no constructor deps)
- `app-operations/toggleColorScheme.ts` → `ToggleColorScheme` (`@injectable()`, injects `UiStateSetter`)
- `app-operations/unloadApplication.ts` → `UnloadApplication`
- `catalog-operations/catalog-list/loadCatalogRefs.ts` → `LoadCatalogRefs` (`@injectable()`, injects `StoreStateSetter`)
- `template-operations/template-list/loadTemplateRefs.ts` → `LoadTemplateRefs`
- All 13 theme operations in `theme-operations/`
- All 5 undo operations in `undo-operations/`
- All 7 window operations in `window-operations/`

**Controllers:**
- All 4 `app-controller/` controllers
- `catalog-controller/catalog-list/loadCatalogPage.ts` → `LoadCatalogPageController` (`@singleton()`, injects operation classes)
- `catalog-controller/catalog-list/loadCatalogRefs.ts` → `LoadCatalogRefsController`
- `tab-controller/setActiveTab.ts` → `SetActiveTabController`
- `template-controller/template-list/loadTemplatePage.ts` → `LoadTemplatePageController`
- `template-controller/template-list/loadTemplateRefs.ts` → `LoadTemplateRefsController`
- `theme-controller/theme-details/incrementThemeVersion.ts` → `IncrementThemeVersionController`
- `theme-controller/theme-details/restoreThemeState.ts` → `RestoreThemeStateController`
- `theme-controller/theme-list/createTheme.ts` → `CreateThemeController`
- `theme-controller/theme-list/deleteThemeVersion.ts` → `DeleteThemeVersionController`
- `theme-controller/theme-list/loadThemePage.ts` → `LoadThemePageController`
- `theme-controller/theme-list/loadThemeRefs.ts` → `LoadThemeRefsController`
- All 4 `undo-controller/` controllers
- All 7 `window-controller/` controllers
