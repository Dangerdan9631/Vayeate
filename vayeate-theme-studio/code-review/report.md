# Vayeate Theme Studio — Code Maintainer Audit

Scope: `vayeate-theme-studio/src/**` and `vayeate-theme-studio/electron/**` (448 TypeScript modules).
Compared to `.cursor/rules/` (app-architecture, layer-app, layer-domain, layer-gateway, layer-electron, controller, operation, validation, viewmodel, component, state, gateway, service, model).

---

## app-architecture.mdc

### Multiple top-level exports per file [app-architecture.mdc, line 45]

- **File:** `vayeate-theme-studio/src/app/app/components/App.tsx`
- **Violation:** Exports both `AppShell` and `App` as named top-level exports from the same file.
- **Suggested fix:** Move `AppShell` into its own file `AppShell.tsx` with a single default export; keep `App.tsx` exporting only `App`.

---

- **File:** `vayeate-theme-studio/src/app/template/viewmodel/use-template-viewmodel.ts`
- **Violation:** Exports `useTemplateViewModel`, `MergeMappingsResult`, `computeOrphanKeys`, and `SemanticCatalogInfo` from the same file. `computeOrphanKeys` and `SemanticCatalogInfo` are domain utilities, not viewmodel concerns.
- **Suggested fix:** Move `computeOrphanKeys` and `SemanticCatalogInfo` to `src/domain/utils/orphan-mappings.ts` (they are already duplicated there). Remove them from this file; import from `orphan-mappings.ts` if needed inside the hook.

---

- **File:** `vayeate-theme-studio/src/app/theme/viewmodel/theme-pane-display.ts`
- **Violation:** Exports `normalizeThemeHex`, `applyHueToAssignmentsFiltered`, `computeDisplayColorAssignments`, and `computeSelectedColorsDisplay` — four unrelated utility functions from a single file that is named as a viewmodel helper but contains domain logic.
- **Suggested fix:** Move each function to its own file or consolidate into a single domain utility file under `src/domain/utils/`. Remove from the app/viewmodel layer entirely.

---

- **File:** `vayeate-theme-studio/src/app/theme/viewmodel/use-theme-viewmodel.ts`
- **Violation:** Exports `useThemeViewModel`, `useThemesPageChromeViewModel`, `mergeAssignmentsFromTemplate`, `computeOrphanColorKeys`, and `computeOrphanContrastKeys`. The last three are domain utility functions, not part of a viewmodel hook's contract.
- **Suggested fix:** Move `mergeAssignmentsFromTemplate`, `computeOrphanColorKeys`, `computeOrphanContrastKeys` to the domain utils layer (e.g., `src/domain/utils/theme-assignment-utils.ts` or separate files). Keep each viewmodel hook in its own file.

---

- **File:** `vayeate-theme-studio/src/domain/core/undo-manager-v2.ts`
- **Violation:** Exports over 15 items from one file: `DEFAULT_MAX_SIZE`, `DEFAULT_STACK_COUNT`, `DEFAULT_DISK_MAX_FRAMES`, `createFrameId`, `UndoActionNoop`, `UndoAction`, `UndoFrame`, `UndoProcessor`, `UndoStackOptions`, `UndoListEntry`, `UndoListResult`, `PersistedStack`, `UndoStack`, `UndoPersistenceAdapter`, `UndoManagerOptions`, `UndoManagerV2`, `createStack`, `createUndoManagerV2`, and `undoManagerV2`.
- **Suggested fix:** Split into at least three files: `undo-stack-types.ts` (all interfaces/types), `undo-stack.ts` (`createStack`), and `undo-manager-v2.ts` (manager and singleton). Use a barrel `index.ts` to re-export publicly needed types.

---

- **File:** `vayeate-theme-studio/src/domain/utils/version.ts`
- **Violation:** Exports `compareVersions`, `nextPatchVersion`, `findNearestVersionRef`, `findBestVersionRef`, and `findHighestVersionRefSameName` — five functions from one file.
- **Suggested fix:** Acceptable to keep grouped since these are tightly related version-comparison helpers, but the file should be renamed to reflect all its exported concerns (e.g., `version-utils.ts`). If the rule is interpreted strictly, split into `compare-versions.ts`, `next-patch-version.ts`, etc.

---

- **File:** `vayeate-theme-studio/src/domain/utils/stack-id.ts`
- **Violation:** Exports `catalogStackId`, `templateStackId`, and `themeStackId` from one file.
- **Suggested fix:** Either keep as-is (closely related utility group) or split into three files. If kept together, the file name `stack-id.ts` does not align to any single export name per the rule.

---

- **File:** `vayeate-theme-studio/src/domain/utils/orphan-mappings.ts`
- **Violation:** Exports `SemanticCatalogInfo` (interface), `computeOrphanKeys` (function), and `isMappingOrphanForTemplate` (function) — three distinct items with different callers.
- **Suggested fix:** Split into `compute-orphan-keys.ts` (exporting `SemanticCatalogInfo` and `computeOrphanKeys`) and `is-mapping-orphan-for-template.ts`, or merge under a single coherent name if kept together.

---

- **File:** `vayeate-theme-studio/src/domain/utils/template-catalog-merge.ts`
- **Violation:** Exports both `CatalogDataItem` (interface) and `mergeMappingsFromCatalogData` (function).
- **Suggested fix:** This is a companion type to the function — acceptable if `CatalogDataItem` is only used with `mergeMappingsFromCatalogData`. No change needed if treated as a primary-export-with-companion pattern; otherwise move the type into `schemas.ts`.

---

- **File:** `vayeate-theme-studio/src/domain/utils/theme-parser.ts`
- **Violation:** Exports `BulkParseResult` (interface) and `parseThemeJson` (function).
- **Suggested fix:** `BulkParseResult` is a companion type to `parseThemeJson`; acceptable as a companion. If the rule is strict, move `BulkParseResult` inline or to schemas.

---

- **File:** `vayeate-theme-studio/src/domain/utils/theme-export-format.ts`
- **Violation:** Exports `toSafeFileName`, `assertValidThemeFileName`, and `stringifyTheme` — three independent functions.
- **Suggested fix:** These are tightly related format utilities; acceptable as a group file but the filename should align with the group concept (e.g., `theme-file-format.ts`).

---

- **File:** `vayeate-theme-studio/src/domain/utils/template-utils.ts`
- **Violation:** Exports `catalogVersionsByNameFromRefs`, `groupNamesInUseFromTemplate`, `referencedColorVarKeysFromTemplate`, and `referencedContrastVarKeysFromTemplate`.
- **Suggested fix:** Split into single-purpose files or ensure the filename (`template-utils.ts`) is replaced with a more descriptive grouping name.

---

- **File:** `vayeate-theme-studio/src/domain/utils/color.ts`
- **Violation:** Exports multiple types (`Rgb`, `Hsl`, `ContrastComparisonMethod`, `AdjustContrastOptions`) and many functions (`normalizeHexSafe`, `normalizeHex`, `applyHueShift`, and others).
- **Suggested fix:** Split domain types into `color-types.ts` and keep utility functions in `color.ts`, or further split by concern (e.g., `hex-utils.ts`, `contrast-utils.ts`).

---

- **File:** `vayeate-theme-studio/src/domain/state/catalog/catalogs-state-reducer.ts`
- **Violation:** Exports `CatalogEntryInput`, `CatalogsStateUpdate` (union type), `catalogsStateReducer`, `SetCatalogsState`, `CatalogsStateSetter`, `GetCatalogsState`, and `CatalogsStateGetter` — seven distinct exports. The same pattern applies to all other `*-state-reducer.ts` files (`themes-state-reducer.ts`, `templates-state-reducer.ts`, `ui-state-reducer.ts`, `undo-stack-state-reducer.ts`, `window-state-reducer.ts`, `app-config-state-reducer.ts`, `queue-status-state-reducer.ts`).
- **Suggested fix:** Co-locating the Getter/Setter with the reducer is intentional infrastructure — consider extracting Getter and Setter classes to a `*-state-accessors.ts` companion file, leaving the reducer in the reducer file. Alternatively, accept this pattern as a deliberate state infrastructure exception if the rules team agrees.

---

- **File:** `vayeate-theme-studio/src/domain/operations/catalog-operations/index.ts`
- **Violation:** Barrel file re-exports over 30 operations and 2 types from a single file.
- **Suggested fix:** Per the rule, each file should have one top-level export; barrel files with many re-exports violate this. Either import each operation directly at its call site (eliminating barrel files), or formally document barrel `index.ts` files as an allowed exception.

- **File:** `vayeate-theme-studio/src/domain/operations/theme-operations/index.ts`
- **Violation:** Same pattern — barrel re-exporting many operations.
- **Suggested fix:** Same as above.

- **File:** `vayeate-theme-studio/src/domain/controllers/catalog-controller/index.ts`
- **Violation:** Barrel re-exporting ~45 controllers and also `catalogStackId` (a utility), mixing concerns.
- **Suggested fix:** Remove `catalogStackId` from this barrel — it belongs in the utils layer. Import controllers directly from their source files.

- **File:** `vayeate-theme-studio/src/domain/controllers/template-controller/index.ts`
- **Violation:** Barrel re-exporting ~50 controllers and `templateStackId` utility.
- **Suggested fix:** Same as catalog-controller index — remove the utility re-export and import from utils directly.

- **File:** `vayeate-theme-studio/src/domain/controllers/theme-controller/index.ts`
- **Violation:** Barrel re-exporting ~60 controllers and `themeStackId` utility.
- **Suggested fix:** Same as above.

---

- **File:** `vayeate-theme-studio/src/app/core/components/AppProvider.tsx`
- **Violation:** Exports `AppContextValue` (interface), `AppContext` (context object), and `AppProvider` (component) from the same file.
- **Suggested fix:** Move `AppContextValue` and `AppContext` to a dedicated `app-context.ts` file; keep `AppProvider.tsx` exporting only the component.

---

### Multiple actions dispatched for a single user interaction [app-architecture.mdc, lines 36–39]

- **File:** `vayeate-theme-studio/src/app/theme/viewmodel/use-theme-palette-card-viewmodel.ts`
- **Violation:** `setHueReferenceHex` dispatches two separate actions (`ThemeActionType.ThemePaletteHueReferenceColorTextOnChange` and `ThemeActionType.ThemePaletteHueSliderOnDelta`) for a single user action of updating the hue reference hex. This is two actions for one user gesture.
- **Suggested fix:** Introduce a single action `THEME_PALETTE_HUE_REFERENCE_COMMIT` that carries the hex value. Route it through a single handler and single `CommitHueReferenceColorController` (which already exists and does both operations atomically).

---

- **File:** `vayeate-theme-studio/src/app/template/viewmodel/use-templates-card-viewmodel.ts`
- **Violation:** `openCreateDialog` dispatches two actions in sequence: `TemplateActionType.TemplateTemplatesCreateButtonOnClick` followed immediately by `TemplateActionType.TemplateCreateDialogOnOpen`, for what is a single user button click.
- **Suggested fix:** Consolidate into a single action `TEMPLATE_CREATE_BUTTON_ON_CLICK`. Inside the handler for that action, invoke the controller that opens the dialog. Remove `TemplateCreateDialogOnOpen` as a separately dispatched action from this path.

---

- **File:** `vayeate-theme-studio/src/app/theme/components/ThemePaletteCard.tsx`
- **Violation:** `setColorRefsChecked` iterates over a list of color refs and dispatches `ThemeVariablesVariableSelectionCheckboxOnToggle` once per ref in a loop, resulting in multiple actions for a single logical "check all" user interaction.
- **Suggested fix:** Add a batch action `THEME_PALETTE_SELECT_ALL_REFS` (or reuse `THEME_VARIABLES_VARIABLE_SELECTION_SET_ALL`) that carries the full list of refs to check as its payload. Route this through a single controller that calls one operation.

---

### App shell lifecycle invoked from viewmodel instead of AppShell component [app-architecture.mdc, lines 21–24]

- **File:** `vayeate-theme-studio/src/app/app/viewmodel/use-app-shell-viewmodel.ts`
- **Violation:** Calls `container.resolve(LoadAppController).run()` and `UnloadAppController.run()` directly from a `useEffect` in the viewmodel hook. The architecture rule grants this exception specifically to `useEffect` calls in the **AppShell component**, not to viewmodel hooks consumed by that component.
- **Suggested fix:** Move the `useEffect` lifecycle calls (load/unload controllers) out of the viewmodel and into the `AppShell` component's own `useEffect`. The viewmodel should only expose state slices and dispatch wrappers; let the component own its lifecycle.

---

## viewmodel.mdc

### Business logic (domain utility calls) inside viewmodel hooks [viewmodel.mdc, lines 14–16]

- **File:** `vayeate-theme-studio/src/app/app/viewmodel/use-menubar-viewmodel.ts`
- **Violation:** Calls `undoManagerV2.getOrCreate(stackId).then(...)` inside a `useEffect` hook to read undo/redo state. This is domain IPC logic (accessing the undo manager singleton) inside a viewmodel, which the rule classes as an anti-pattern ("Business rules or IPC belongs in operations/gateways").
- **Suggested fix:** Expose `canUndo`, `canRedo`, and undo history through app state setters (already have `UndoStackStateSetter`). After undo/redo operations update state, the viewmodel reads from state via `useContextSelector` — no direct `undoManagerV2` access needed in the viewmodel.

---

- **File:** `vayeate-theme-studio/src/app/catalog/viewmodel/use-bulk-add-dialog-viewmodel.ts`
- **Violation:** Calls `parseThemeJson(bulkAddText)` inside a `useMemo` hook to derive token counts for the UI. `parseThemeJson` is a domain parsing utility that belongs in operations.
- **Suggested fix:** Parse the JSON in `BulkAddTokensController` or a dedicated operation and write the result (counts, error status) to state. The viewmodel reads the count from state via `useContextSelector` rather than parsing in the hook.

---

- **File:** `vayeate-theme-studio/src/app/theme/viewmodel/use-editor-previews-card-viewmodel.ts`
- **Violation:** Calls `computeDisplayColorAssignments` (a domain utility that computes color display data) inside a `useMemo` hook. This is business logic computing resolved color values inside a viewmodel.
- **Suggested fix:** Move the computation into an operation invoked after theme or template changes, storing the computed display data in app state. The viewmodel reads this pre-computed slice from state.

---

- **File:** `vayeate-theme-studio/src/app/theme/viewmodel/use-theme-palette-card-viewmodel.ts`
- **Violation:** Directly calls and uses `normalizeThemeHex`, `buildThemePaneSnapshot`, `resolveColorForThemeTokenKey`, `computeDisplayColorAssignments`, and `computeSelectedColorsDisplay` inside the viewmodel hook. These are domain-level color resolution and theme display computations.
- **Suggested fix:** Pre-compute display data (resolved hex per color ref, selected colors summary) in operations and write to state. The viewmodel reads the computed fields via `useContextSelector`. Thin helpers that are purely presentational can stay, but domain resolution logic (calling gateway-level color resolvers) belongs in operations.

---

- **File:** `vayeate-theme-studio/src/app/theme/viewmodel/use-theme-variables-card-viewmodel.ts`
- **Violation:** Imports and uses `computeOrphanColorKeys` and `computeOrphanContrastKeys` from `use-theme-viewmodel.ts`, creating a viewmodel-to-viewmodel dependency on domain utility functions.
- **Suggested fix:** Move these utility functions to `src/domain/utils/` (they already overlap with `orphan-mappings.ts`). Import from utils, not from another viewmodel. Better: pre-compute orphan key sets in an operation and store in state so viewmodels only need `useContextSelector`.

---

### Module-level mutable flag used as lifecycle guard [viewmodel.mdc, layer-app.mdc]

- **File:** `vayeate-theme-studio/src/app/catalog/viewmodel/use-catalog-viewmodel.ts`
- **Violation:** Uses a module-level mutable boolean `catalogPageLoadDispatched` to prevent double-dispatching the `CATALOG_PAGE_ON_LOAD` action. Module-level state persists across React component mounts and undermines React's strict-mode double-effect behavior.
- **Suggested fix:** Use a `useRef` inside the hook to track whether the effect has already dispatched for this mount cycle. This scopes the guard to the component instance instead of the module.

---

- **File:** `vayeate-theme-studio/src/app/template/viewmodel/use-template-viewmodel.ts`
- **Violation:** Same pattern — module-level `templatePageLoadDispatched` boolean.
- **Suggested fix:** Same as above — use `useRef` inside the viewmodel hook.

---

- **File:** `vayeate-theme-studio/src/app/theme/viewmodel/use-theme-viewmodel.ts`
- **Violation:** Same pattern — module-level `themePageLoadDispatched` boolean.
- **Suggested fix:** Same as above — use `useRef` inside the viewmodel hook.

---

## component.mdc

### Event props reference factory functions instead of named functions [component.mdc]

- **File:** `vayeate-theme-studio/src/app/catalog/components/CatalogDetailsCard.tsx`
- **Violation:** `onFocus={beginEditSourceUrl(i, source.url)}` and `onBlur={finishEditSourceUrl(i, source.url)}` invoke factory functions in the JSX, creating new function references on every render instead of referencing stable named functions.
- **Suggested fix:** Replace with `useCallback`-wrapped named handlers that close over the index and url, or wrap the repeated call pattern as a `useCallback` handler taking the event that derives `i` and `url` from state, then reference the named handler.

---

- **File:** `vayeate-theme-studio/src/app/catalog/components/TokensCard.tsx`
- **Violation:** `onTokenOptionClick`, `onMemberSwatchClick`, `onMemberSwatchContextMenu`, and `onMemberSwatchKeyDown` are factory functions returning event handlers and are invoked inline in JSX (e.g., `onClick={onTokenOptionClick(token)}`).
- **Suggested fix:** Extract into named `useCallback` handlers. Pass the item identifier as a data attribute (e.g., `data-token-key`) and read it from `event.currentTarget.dataset` inside a single stable handler, or use a dedicated child component per item that owns its own named handler.

---

- **File:** `vayeate-theme-studio/src/app/template/components/MappingsCard.tsx`
- **Violation:** `handleGroupRefChange`, `handleColorRefChange`, `handleContrastRefChange`, `handleModifierOptionClick`, `handleLanguageNoneClick`, and `handleLanguageOptionClick` are factory functions invoked with per-row arguments inline in JSX.
- **Suggested fix:** Same pattern as above — named `useCallback` handlers reading index/key from dataset, or child component per row.

---

- **File:** `vayeate-theme-studio/src/app/theme/components/EditorPreviewsCard.tsx`
- **Violation:** `onTokenOptionClick`, `onDarkSampleItemClick`, and `onLightSampleItemClick` are defined as factory functions and called inline in JSX (`onClick={onTokenOptionClick(token)}`).
- **Suggested fix:** Extract to named `useCallback` handlers reading the token key from `event.currentTarget.dataset`.

---

- **File:** `vayeate-theme-studio/src/app/theme/components/ThemePaletteCard.tsx`
- **Violation:** `onPrimarySwatchClick`, `onPrimarySwatchContextMenu`, `onPrimarySwatchKeyDown`, `onMemberSwatchClick`, `onMemberSwatchContextMenu`, and `onMemberSwatchKeyDown` are factory functions invoked inline per swatch item.
- **Suggested fix:** Same pattern — named handlers reading colorRef from `event.currentTarget.dataset` or a dedicated swatch child component.

---

### Component contains conditional business logic [component.mdc, layer-app.mdc]

- **File:** `vayeate-theme-studio/src/app/catalog/components/CatalogDetailsCard.tsx`
- **Violation:** `onNewSourceTokenTypeChange` contains a conditional branch that sets `newSourceType` based on the selected `tokenType` (`if (tokenType === 'semantic token') dispatch(SetNewSourceType('semantic-token-registry'))`). This conditional derivation of one field from another is domain/business logic, not UI state management.
- **Suggested fix:** Move this conditional logic into the controller that handles the `CATALOG_SOURCE_TOKEN_TYPE_ON_CHANGE` action. The controller (or a validation) maps `tokenType` → appropriate `sourceType` and calls the respective operations. The component only dispatches the action with the raw user selection.

---

### Component dispatches actions bypassing its viewmodel [component.mdc, layer-app.mdc]

- **File:** `vayeate-theme-studio/src/app/theme/components/ThemesPage.tsx`
- **Violation:** `dismissSaveError` callback calls `useAppDispatch()` directly in the component, bypassing the component's associated viewmodel (`useThemesPageChromeViewModel`). This breaks the consistent pattern where all dispatch calls from a component go through its viewmodel.
- **Suggested fix:** Add `dismissSaveError` to `useThemesPageChromeViewModel` as a dispatch callback, then expose it from the viewmodel. The component calls the viewmodel's callback, not the dispatch hook directly.

---

- **File:** `vayeate-theme-studio/src/app/theme/components/ThemePaletteCard.tsx`
- **Violation:** The component calls `useAppDispatch()` directly alongside `useThemePaletteCardViewModel()` for the eyedropper action, creating an inconsistent dual dispatch pattern.
- **Suggested fix:** Add the eyedropper dispatch callback to `useThemePaletteCardViewModel`; remove the direct `useAppDispatch` call from the component.

---

## operation.mdc

### Operation injects and calls controllers [operation.mdc, line 13]

- **File:** `vayeate-theme-studio/src/domain/operations/app-operations/initialize-window-service-operation.ts`
- **Violation:** Injects `OnWindowStateEventController`, `OnWindowResizeEventController`, `OnWindowMoveEventController`, `OnViewportResizeEventController`, and `OnGlobalKeyDownEventController` — five controllers — and registers their `run()` methods as callbacks passed to `WindowService.init()`. The operation.mdc rule states operations "must not call another operation" and by extension must not call controllers (the architecture's call direction is UI → queue → handler → controller → operation, not the reverse).
- **Suggested fix:** Invert the dependency: have `WindowService` emit events through the action queue directly, using `AppActionEnqueueGateway` (or a similar gateway) to enqueue window-state actions that the handler layer then routes to controllers. Alternatively, introduce a `WindowEventGateway` that the operation wires to the service, with the gateway enqueueing the appropriate actions.

---

### Operations access module-level singleton instead of gateway [operation.mdc, layer-domain.mdc]

- **File:** `vayeate-theme-studio/src/domain/operations/undo-operations/perform-undo-operation.ts`
- **Violation:** Calls `undoManagerV2.getOrCreate(stackId)` directly — `undoManagerV2` is a module-level singleton not registered with tsyringe. The operation bypasses the gateway/service pattern for this system resource.
- **Suggested fix:** Introduce an `UndoStackService` or `UndoManagerGateway` (under `src/gateway/undo/`) that wraps `undoManagerV2.getOrCreate()`. Inject the gateway into the operation as a concrete type. `UndoGateway` already exists for persistence — extend it or create a sibling service.

---

- **File:** `vayeate-theme-studio/src/domain/operations/undo-operations/perform-redo-operation.ts`
- **Violation:** Same as `PerformUndoOperation` — calls `undoManagerV2.getOrCreate(stackId)` directly.
- **Suggested fix:** Same — inject an `UndoManagerGateway` or `UndoStackService` that encapsulates the singleton access.

---

## controller.mdc

### Controller defines a local function that calls operation execute [controller.mdc, line 26–29]

- **File:** `vayeate-theme-studio/src/domain/controllers/template-controller/template-details/update-all-catalogs-controller.ts`
- **Violation:** Defines a module-level free function `loadCatalogData(loadCatalogSnapshot, refs)` that calls `loadCatalogSnapshot.execute(...)` inside a loop. The controller delegates operation calls to this unregistered local function, introducing an orchestration helper outside the normal controller body. Business orchestration steps should remain in the controller's `run()` method or be pushed into a dedicated operation.
- **Suggested fix:** Inline the `loadCatalogData` logic directly in `run()`, or move the loop into a `LoadCatalogsForDisplayOperation` that accepts a list of refs and handles the iteration. Remove the free function.

---

## gateway.mdc

### Gateway exports standalone parsing function with business logic [gateway.mdc, lines 10–11]

- **File:** `vayeate-theme-studio/src/gateway/catalog/token-sync-gateway.ts`
- **Violation:** Exports a standalone async function `syncCatalogTokens` (and companion types `SemanticRegistryParseResult`, `FetchText`, `SyncCatalogResult`) alongside the `TokenSyncGateway` class. The `syncCatalogTokens` function contains significant parsing logic: candidate extraction, token filtering by type, deduplication, sorting, and semantic type/modifier/language extraction. This is business logic that belongs in an operation, not gateway conversion code.
- **Suggested fix:** Move the parsing and filtering logic from `syncCatalogTokens` into a domain utility (e.g., `src/domain/utils/token-sync-parser.ts`) or operation. Keep `TokenSyncGateway.sync()` as a thin wrapper that calls `WebService.fetchUrl()` for each source and delegates parsing to a domain utility. Remove the standalone function export to avoid multiple top-level exports.

---

### Gateway imports from app layer [layer-gateway.mdc]

- **File:** `vayeate-theme-studio/src/gateway/app-action-enqueue-gateway.ts`
- **Violation:** Imports `AppAction` type from `../app/core/actions/app-action`, creating an upward dependency from the gateway layer into the app layer. The gateway layer should not depend on app-layer types.
- **Suggested fix:** The `enqueue` method already accepts `unknown` as parameter type in practice. Remove the `AppAction` import; use `unknown` as the parameter type in the public interface. The `container.resolve(ActionQueue).enqueue(action as AppAction)` cast can remain as an internal implementation detail without the type leaking into the gateway's signature.

---

## service.mdc

### Service files export companion types alongside the service class [app-architecture.mdc, line 45; service.mdc]

- **File:** `vayeate-theme-studio/src/gateway/services/window-service.ts`
- **Violation:** Exports `WindowStateEvent` (type), `WindowInitCallbacks` (interface), and `WindowService` class from the same file — three top-level exports.
- **Suggested fix:** Move `WindowStateEvent` and `WindowInitCallbacks` to a separate `window-service-types.ts` file, or keep them as co-located companion types if the "primary export" interpretation is used. At minimum, document the intended exception.

---

- **File:** `vayeate-theme-studio/src/gateway/services/screenshot-service.ts`
- **Violation:** Exports `ScreenshotDisplayEntry` (type), `ScreenshotFullDisplaySnapshot` (type), and `ScreenshotService` class from the same file.
- **Suggested fix:** Move the two types to `screenshot-service-types.ts`, or co-locate as companions to the service if this pattern is explicitly permitted.

---

- **File:** `vayeate-theme-studio/src/gateway/services/log-service.ts`
- **Violation:** Exports `LogLevel` (type) and `LogService` class from the same file.
- **Suggested fix:** `LogLevel` is a tightly coupled companion type to `LogService` — this is the most defensible multi-export in the codebase. Acceptable under the "primary export with companion types" interpretation. If strict, move to `log-service-types.ts`.

---

## model.mdc

### Model file has multiple primary exports [model.mdc, line 14]

- **File:** `vayeate-theme-studio/src/model/schemas.ts`
- **Violation:** Single file exports every domain schema and derived type: all catalog, template, theme, window, config schemas, plus primitive types, hex color transform, etc. This is a single aggregation file serving as a namespace, not a file with one primary export.
- **Suggested fix:** Split into domain-specific schema files: `catalog-schema.ts`, `template-schema.ts`, `theme-schema.ts`, `app-config-schema.ts`, `shared-primitives.ts`. Create a barrel `src/model/schemas/index.ts` if callers need a single import point. This aligns each file with one primary entity.

---

- **File:** `vayeate-theme-studio/src/model/semantic-token.ts`
- **Violation:** Exports `SEMANTIC_WILDCARD_TYPE` (constant), `ParsedSemanticSelector` (interface), `SemanticCatalogArrays` (interface), `parseSemanticSelector` (function), `mergeSemanticSelectorInto` (function), and `formatSemanticSelector` (function) — three distinct concerns (types, selector parsing, selector formatting) in one file.
- **Suggested fix:** The parsing and formatting functions could each be their own file (`parse-semantic-selector.ts`, `format-semantic-selector.ts`, `merge-semantic-selector.ts`) with associated types inlined. `SEMANTIC_WILDCARD_TYPE` can live in `parse-semantic-selector.ts`.

---

- **File:** `vayeate-theme-studio/src/model/theme-pane-state.ts`
- **Violation:** Exports `ThemePaneState` (interface), `SelectedColorsDisplay` (union type), and `buildThemePaneSnapshot` (factory function). The factory function `buildThemePaneSnapshot` is behavior, not a pure model type/schema — it does not use zod and does not belong in the model layer.
- **Suggested fix:** Move `buildThemePaneSnapshot` to `src/domain/utils/` (e.g., `theme-pane-utils.ts`). Keep only `ThemePaneState` and `SelectedColorsDisplay` in the model file.

---

- **File:** `vayeate-theme-studio/src/model/preview-types.ts`
- **Violation:** Exports `TokenizedToken`, `TokenizedLine`, and `TokenizedPreview` — three interface types that together define a single tokenized preview document. These are more companion types to a single concept than three independent exports.
- **Suggested fix:** Minor issue. Acceptable as companion types to the `TokenizedPreview` concept. If strict, collapse into one `TokenizedPreview` type with inline nested types.

---

- **File:** `vayeate-theme-studio/src/model/factories/index.ts`
- **Violation:** Re-exports `createCatalogWithParams`/`CreateCatalogParams`, `createTemplateWithParams`/`CreateTemplateParams`, and `createThemeWithParams`/`CreateThemeParams` from three different factory files.
- **Suggested fix:** Import factory functions directly from their source files at call sites (e.g., `import { createCatalogWithParams } from '../model/factories/catalog-factory'`). Remove the barrel. Each factory file's two-export pattern (type + function) is a minor companion-type issue but acceptable.

---

## state.mdc

### React component directly imports state setter [state.mdc, line 24]

- **File:** `vayeate-theme-studio/src/domain/operations/theme-operations/theme-details/debounced-theme-gateway-save.ts`
- **Violation:** This module-level file accepts `ThemesStateSetter` as a function parameter in `scheduleDebouncedThemePersist` and calls it from a `setTimeout` callback — effectively letting the debounce timer call a state setter asynchronously outside of any React render cycle or operation context. Module-level `saveThemeTimeoutId` and `pendingThemeToSave` are mutable singletons bypassing the app state model.
- **Suggested fix:** Move the debounce logic inside `ApplyThemeStateAndSchedulePersistOperation` or a dedicated `DebouncedThemePersistService` registered with tsyringe, holding internal state as instance properties (not module-level globals). This keeps the timer state encapsulated and avoids module-level mutability.

---

- **File:** `vayeate-theme-studio/src/domain/operations/theme-details/debounced-theme-gateway-save.ts`
- **Violation:** Also exports two top-level functions: `clearPendingSave` and `scheduleDebouncedThemePersist` — two exports per file and module-level mutable state.
- **Suggested fix:** Consolidate into a `DebouncedThemePersistService` class (with `schedule` and `cancel` methods) registered as `@singleton()`. This provides tsyringe management of the timer state and a single top-level export.
