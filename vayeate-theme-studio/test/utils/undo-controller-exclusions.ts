/**
 * Controllers that must NOT record undo entries.
 *
 * Source: plan-3-universal-undo-coverage.md inventories (phases B3, B4, C6, D6, D7, E).
 * Consumed by Phase F enforcement test — every other `*-controller.ts` under `src/app/**`
 * must import `Record*UndoOperation` or `RecordUndoEntryOperation`.
 *
 * Paths are relative to the repository root (`src/app/...`).
 */

// ---------------------------------------------------------------------------
// Phase B3 — Catalog: non-state-changing (13)
// ---------------------------------------------------------------------------

/**
 * Dialog open/close, input staging, search filters, selection/navigation.
 */
export const CATALOG_NON_STATE_CHANGING_EXCLUDED_CONTROLLERS = [
  'src/app/controllers/Catalog/bulk-add-dialog/open-bulk-add-dialog-controller.ts',
  'src/app/controllers/Catalog/bulk-add-dialog/close-bulk-add-dialog-controller.ts',
  'src/app/controllers/Catalog/bulk-add-dialog/set-catalog-bulk-add-text-controller.ts',
  'src/app/controllers/Catalog/catalog-details-card/set-catalog-new-source-token-type-controller.ts',
  'src/app/controllers/Catalog/catalog-details-card/set-catalog-new-source-type-controller.ts',
  'src/app/controllers/Catalog/catalog-details-card/set-catalog-new-source-url-controller.ts',
  'src/app/controllers/Catalog/catalogs-card/set-selected-catalog-controller.ts',
  'src/app/controllers/Catalog/create-dialog/open-catalog-create-dialog-controller.ts',
  'src/app/controllers/Catalog/create-dialog/set-catalog-create-dialog-name-controller.ts',
  'src/app/controllers/Catalog/create-dialog/set-catalog-create-dialog-type-controller.ts',
  'src/app/controllers/Catalog/tokens-card/set-catalog-new-semantic-token-selector-text-controller.ts',
  'src/app/controllers/Catalog/tokens-card/set-catalog-new-token-key-controller.ts',
  'src/app/controllers/Catalog/tokens-card/set-catalog-tokens-search-text-controller.ts',
] as const;

// ---------------------------------------------------------------------------
// Phase B4 — Catalog: lifecycle (1)
// ---------------------------------------------------------------------------

/**
 * `CATALOG_PAGE_ON_LOAD` hydration; no user edit.
 */
export const CATALOG_LIFECYCLE_EXCLUDED_CONTROLLERS = [
  'src/app/controllers/Catalog/catalog-page/load-catalog-page-controller.ts',
] as const;

// ---------------------------------------------------------------------------
// Phase C6 — Template: non-state-changing (15)
// ---------------------------------------------------------------------------

/**
 * Draft input staging, search/UI filters, dialog open/close, selection/navigation, lifecycle.
 */
export const TEMPLATE_NON_STATE_CHANGING_EXCLUDED_CONTROLLERS = [
  'src/app/controllers/Template/variables-card/set-template-add-variable-name-controller.ts',
  'src/app/controllers/Template/variables-card/set-variables-search-text-controller.ts',
  'src/app/controllers/Template/groups-card/set-template-add-group-name-controller.ts',
  'src/app/controllers/Template/mappings-card/set-mapping-search-text-controller.ts',
  'src/app/controllers/Template/mappings-card/set-mapping-color-variable-filter-controller.ts',
  'src/app/controllers/Template/mappings-card/set-mapping-contrast-variable-filter-controller.ts',
  'src/app/controllers/Template/mappings-card/set-mapping-style-variable-filter-controller.ts',
  'src/app/controllers/Template/mappings-card/clear-selected-mappings-controller.ts',
  'src/app/controllers/Template/mappings-card/toggle-selected-mapping-controller.ts',
  'src/app/controllers/Template/mappings-card/set-mapping-group-selection-controller.ts',
  'src/app/controllers/Template/mappings-card/set-mapping-token-type-selection-controller.ts',
  'src/app/controllers/Template/create-template-dialog/set-create-form-name-controller.ts',
  'src/app/controllers/Template/templates-card/open-create-dialog-controller.ts',
  'src/app/controllers/Template/create-template-dialog/close-create-dialog-controller.ts',
  'src/app/controllers/Template/templates-card/select-template-and-load-controller.ts',
  'src/app/controllers/Template/template-page/load-template-page-controller.ts',
] as const;

// C5 legacy `restore-template-state-controller.ts` removed per plan cleanup.

// ---------------------------------------------------------------------------
// Phase D6 — Theme: non-state-changing (13)
// ---------------------------------------------------------------------------

/**
 * Selection/navigation, dialog staging, lifecycle hydration, live previews, transient slider.
 */
export const THEME_NON_STATE_CHANGING_EXCLUDED_CONTROLLERS = [
  'src/app/controllers/Theme/themes-card/select-theme-and-load-controller.ts',
  'src/app/controllers/Theme/themes-card/select-theme-by-name-controller.ts',
  'src/app/controllers/Theme/themes-card/open-theme-create-dialog-controller.ts',
  'src/app/controllers/Theme/themes-card/open-theme-duplicate-dialog-controller.ts',
  'src/app/controllers/Theme/create-theme-dialog/close-theme-create-dialog-controller.ts',
  'src/app/controllers/Theme/create-theme-dialog/set-theme-create-form-name-controller.ts',
  'src/app/controllers/Theme/theme-page/load-theme-page-controller.ts',
  'src/app/controllers/Theme/theme-page/clear-theme-save-error-controller.ts',
  'src/app/controllers/Theme/editor-previews-card/load-theme-previews-controller.ts',
  'src/app/controllers/Theme/editor-previews-card/resolve-editor-preview-scope-map-controller.ts',
  'src/app/controllers/Theme/theme-variables-card/set-theme-variables-search-text-controller.ts',
  'src/app/controllers/Theme/theme-palette-card/set-assign-color-preview-controller.ts',
  'src/app/controllers/Theme/theme-palette-card/set-palette-cluster-count-k-preview-controller.ts',
  'src/app/controllers/Theme/theme-palette-card/set-theme-hue-adjustment-controller.ts',
  'src/app/controllers/Theme/theme-palette-card/set-theme-saturation-adjustment-controller.ts',
  'src/app/controllers/Theme/theme-palette-card/set-theme-value-adjustment-controller.ts',
  'src/app/controllers/Theme/theme-palette-card/compute-palette-clusters-controller.ts',
  'src/app/controllers/Theme/theme-palette-card/set-palette-cluster-by-dark-controller.ts',
] as const;

// ---------------------------------------------------------------------------
// Phase D7 — Theme: internal/infrastructure/non-reversible (2 on disk)
// ---------------------------------------------------------------------------

/**
 * Internal follow-up persist, non-reversible export.
 */
export const THEME_INFRASTRUCTURE_EXCLUDED_CONTROLLERS = [
  'src/app/controllers/Theme/theme-palette-card/persist-current-theme-controller.ts',
  'src/app/controllers/Theme/theme-details-card/generate-theme-controller.ts',
] as const;

// D7 also listed (deleted per plan cleanup): restore-theme-state-controller.ts,
// set-theme-pane-selections-controller.ts, set-theme-hue-reference-hex-controller.ts.

// ---------------------------------------------------------------------------
// Phase E — App shell, common, core (33)
// ---------------------------------------------------------------------------

/**
 * Undo/redo/goto and keyboard shortcut routing — never record.
 */
export const APP_UNDO_INFRASTRUCTURE_EXCLUDED_CONTROLLERS = [
  'src/app/core/Undo/undo/undo-controller.ts',
  'src/app/core/Undo/undo/redo-controller.ts',
  'src/app/core/Undo/undo/history-go-to-controller.ts',
  'src/app/controllers/Common/app-shell/handle-keyboard-shortcut-controller.ts',
] as const;

/**
 * App bootstrap, startup undo clear, window callback registration.
 */
export const APP_LIFECYCLE_EXCLUDED_CONTROLLERS = [
  'src/app/controllers/Common/app-shell/load-app-controller.ts',
  'src/app/controllers/Common/app-shell/unload-app-controller.ts',
  'src/app/core/Common/bootstrap/bootstrap-app-controller.ts',
  'src/app/controllers/Common/window/initialize-window-callbacks-controller.ts',
] as const;

/**
 * Tab switch switches undo context only; never records.
 */
export const APP_NAVIGATION_EXCLUDED_CONTROLLERS = [
  'src/app/controllers/Common/ribbon/set-active-tab-controller.ts',
] as const;

/**
 * App color scheme preference — explicitly non-undo per spec.
 */
export const APP_PREFERENCE_EXCLUDED_CONTROLLERS = [
  'src/app/controllers/Common/app-shell/toggle-color-scheme-controller.ts',
  'src/app/controllers/Common/app-shell/set-color-scheme-controller.ts',
] as const;

/**
 * Window chrome and developer tooling.
 */
export const APP_WINDOW_CHROME_EXCLUDED_CONTROLLERS = [
  'src/app/controllers/Common/window/close-window-controller.ts',
  'src/app/controllers/Common/window/drag-window-controller.ts',
  'src/app/controllers/Common/window/maximize-window-controller.ts',
  'src/app/controllers/Common/window/minimize-window-controller.ts',
  'src/app/controllers/Common/window/restore-window-controller.ts',
  'src/app/controllers/Common/app-shell/reload-window-controller.ts',
  'src/app/controllers/Common/app-shell/force-reload-window-controller.ts',
  'src/app/controllers/Common/app-shell/toggle-dev-tools-controller.ts',
] as const;

/**
 * Menu open/close and styled tooltip show/hide/reposition.
 */
export const APP_MENUS_TOOLTIPS_EXCLUDED_CONTROLLERS = [
  'src/app/controllers/Common/menu-bar/toggle-menu-open-controller.ts',
  'src/app/controllers/Common/menu-bar/close-all-menus-controller.ts',
  'src/app/controllers/Common/styled-tooltip/show-styled-tooltip-controller.ts',
  'src/app/controllers/Common/styled-tooltip/hide-styled-tooltip-controller.ts',
  'src/app/controllers/Common/styled-tooltip/reposition-styled-tooltip-controller.ts',
] as const;

/**
 * Transient eyedropper overlay; commit lands in theme controllers (D2).
 */
export const COMMON_EYEDROPPER_EXCLUDED_CONTROLLERS = [
  'src/app/controllers/Common/eyedropper-overlay/open-eyedropper-overlay-controller.ts',
  'src/app/controllers/Common/eyedropper-overlay/close-eyedropper-overlay-controller.ts',
  'src/app/controllers/Common/eyedropper-overlay/eyedropper-overlay-mouse-move-controller.ts',
  'src/app/controllers/Common/eyedropper-overlay/eyedropper-overlay-wheel-scroll-controller.ts',
  'src/app/controllers/Common/eyedropper-overlay/eyedropper-overlay-viewport-size-change-controller.ts',
] as const;

/**
 * Action/background queue status — documented architecture exception.
 */
export const CORE_QUEUE_STATUS_EXCLUDED_CONTROLLERS = [
  'src/app/core/Queue/action-queue/controllers/update-action-queue-status-controller.ts',
  'src/app/core/Queue/action-queue/controllers/signal-action-queue-processing-complete-controller.ts',
  'src/app/core/Queue/background-queue/controllers/update-background-queue-status-controller.ts',
  'src/app/core/Queue/background-queue/controllers/signal-background-queue-processing-complete-controller.ts',
] as const;

// ---------------------------------------------------------------------------
// Flat inventory for Phase F enforcement
// ---------------------------------------------------------------------------

export const UNDO_RECORDING_EXCLUDED_CONTROLLERS: readonly string[] = [
  ...CATALOG_NON_STATE_CHANGING_EXCLUDED_CONTROLLERS,
  ...CATALOG_LIFECYCLE_EXCLUDED_CONTROLLERS,
  ...TEMPLATE_NON_STATE_CHANGING_EXCLUDED_CONTROLLERS,
  ...THEME_NON_STATE_CHANGING_EXCLUDED_CONTROLLERS,
  ...THEME_INFRASTRUCTURE_EXCLUDED_CONTROLLERS,
  ...APP_UNDO_INFRASTRUCTURE_EXCLUDED_CONTROLLERS,
  ...APP_LIFECYCLE_EXCLUDED_CONTROLLERS,
  ...APP_NAVIGATION_EXCLUDED_CONTROLLERS,
  ...APP_PREFERENCE_EXCLUDED_CONTROLLERS,
  ...APP_WINDOW_CHROME_EXCLUDED_CONTROLLERS,
  ...APP_MENUS_TOOLTIPS_EXCLUDED_CONTROLLERS,
  ...COMMON_EYEDROPPER_EXCLUDED_CONTROLLERS,
  ...CORE_QUEUE_STATUS_EXCLUDED_CONTROLLERS,
] as const;
