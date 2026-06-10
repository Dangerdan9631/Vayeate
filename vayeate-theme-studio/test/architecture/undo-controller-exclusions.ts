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

/** Dialog open/close, input staging, search filters, selection/navigation. */
export const CATALOG_NON_STATE_CHANGING_EXCLUDED_CONTROLLERS = [
  'src/app/catalog/bulk-add-dialog/controllers/open-bulk-add-dialog-controller.ts',
  'src/app/catalog/bulk-add-dialog/controllers/close-bulk-add-dialog-controller.ts',
  'src/app/catalog/bulk-add-dialog/controllers/set-catalog-bulk-add-text-controller.ts',
  'src/app/catalog/catalog-details-card/controllers/set-catalog-new-source-token-type-controller.ts',
  'src/app/catalog/catalog-details-card/controllers/set-catalog-new-source-type-controller.ts',
  'src/app/catalog/catalog-details-card/controllers/set-catalog-new-source-url-controller.ts',
  'src/app/catalog/catalogs-card/controllers/set-selected-catalog-controller.ts',
  'src/app/catalog/create-dialog/controllers/open-catalog-create-dialog-controller.ts',
  'src/app/catalog/create-dialog/controllers/set-catalog-create-dialog-name-controller.ts',
  'src/app/catalog/create-dialog/controllers/set-catalog-create-dialog-type-controller.ts',
  'src/app/catalog/tokens-card/controllers/set-catalog-new-semantic-token-selector-text-controller.ts',
  'src/app/catalog/tokens-card/controllers/set-catalog-new-token-key-controller.ts',
  'src/app/catalog/tokens-card/controllers/set-catalog-tokens-search-text-controller.ts',
] as const;

// ---------------------------------------------------------------------------
// Phase B4 — Catalog: lifecycle (1)
// ---------------------------------------------------------------------------

/** `CATALOG_PAGE_ON_LOAD` hydration; no user edit. */
export const CATALOG_LIFECYCLE_EXCLUDED_CONTROLLERS = [
  'src/app/catalog/catalog-page/controllers/load-catalog-page-controller.ts',
] as const;

// ---------------------------------------------------------------------------
// Phase C6 — Template: non-state-changing (11)
// ---------------------------------------------------------------------------

/** Draft input staging, search/UI filters, dialog open/close, selection/navigation, lifecycle. */
export const TEMPLATE_NON_STATE_CHANGING_EXCLUDED_CONTROLLERS = [
  'src/app/template/variables-card/controllers/set-template-add-variable-name-controller.ts',
  'src/app/template/variables-card/controllers/set-variables-search-text-controller.ts',
  'src/app/template/groups-card/controllers/set-template-add-group-name-controller.ts',
  'src/app/template/mappings-card/controllers/set-mapping-search-text-controller.ts',
  'src/app/template/mappings-card/controllers/set-mapping-color-variable-filter-controller.ts',
  'src/app/template/mappings-card/controllers/set-mapping-contrast-variable-filter-controller.ts',
  'src/app/template/create-template-dialog/controllers/set-create-form-name-controller.ts',
  'src/app/template/templates-card/controllers/open-create-dialog-controller.ts',
  'src/app/template/create-template-dialog/controllers/close-create-dialog-controller.ts',
  'src/app/template/templates-card/controllers/select-template-and-load-controller.ts',
  'src/app/template/template-page/controllers/load-template-page-controller.ts',
] as const;

// C5 legacy `restore-template-state-controller.ts` removed per plan cleanup.

// ---------------------------------------------------------------------------
// Phase D6 — Theme: non-state-changing (13)
// ---------------------------------------------------------------------------

/** Selection/navigation, dialog staging, lifecycle hydration, live previews, transient slider. */
export const THEME_NON_STATE_CHANGING_EXCLUDED_CONTROLLERS = [
  'src/app/theme/themes-card/controllers/select-theme-and-load-controller.ts',
  'src/app/theme/themes-card/controllers/select-theme-by-name-controller.ts',
  'src/app/theme/themes-card/controllers/open-theme-create-dialog-controller.ts',
  'src/app/theme/create-theme-dialog/controllers/close-theme-create-dialog-controller.ts',
  'src/app/theme/create-theme-dialog/controllers/set-theme-create-form-name-controller.ts',
  'src/app/theme/theme-page/controllers/load-theme-page-controller.ts',
  'src/app/theme/theme-page/controllers/clear-theme-save-error-controller.ts',
  'src/app/theme/editor-previews-card/controllers/load-theme-previews-controller.ts',
  'src/app/theme/theme-variables-card/controllers/set-theme-variables-search-text-controller.ts',
  'src/app/theme/theme-palette-card/controllers/set-color-refs-selection-batch-controller.ts',
  'src/app/theme/theme-palette-card/controllers/set-assign-color-preview-controller.ts',
  'src/app/theme/theme-palette-card/controllers/set-palette-cluster-count-k-preview-controller.ts',
  'src/app/theme/theme-palette-card/controllers/set-theme-hue-adjustment-controller.ts',
] as const;

// ---------------------------------------------------------------------------
// Phase D7 — Theme: internal/infrastructure/non-reversible (2 on disk)
// ---------------------------------------------------------------------------

/** Internal follow-up persist, non-reversible export. */
export const THEME_INFRASTRUCTURE_EXCLUDED_CONTROLLERS = [
  'src/app/theme/theme-palette-card/controllers/persist-current-theme-controller.ts',
  'src/app/theme/theme-details-card/controllers/generate-theme-controller.ts',
] as const;

// D7 also listed (deleted per plan cleanup): restore-theme-state-controller.ts,
// set-theme-pane-selections-controller.ts, set-theme-hue-reference-hex-controller.ts.

// ---------------------------------------------------------------------------
// Phase E — App shell, common, core (33)
// ---------------------------------------------------------------------------

/** Undo/redo/goto and keyboard shortcut routing — never record. */
export const APP_UNDO_INFRASTRUCTURE_EXCLUDED_CONTROLLERS = [
  'src/app/core/undo/undo-controller.ts',
  'src/app/core/undo/redo-controller.ts',
  'src/app/core/undo/history-go-to-controller.ts',
  'src/app/app/app-shell/controllers/handle-keyboard-shortcut-controller.ts',
] as const;

/** App bootstrap, startup undo clear, window callback registration. */
export const APP_LIFECYCLE_EXCLUDED_CONTROLLERS = [
  'src/app/app/app-shell/controllers/load-app-controller.ts',
  'src/app/app/app-shell/controllers/unload-app-controller.ts',
  'src/app/core/bootstrap/bootstrap-app-controller.ts',
  'src/app/app/window/controllers/initialize-window-callbacks-controller.ts',
] as const;

/** Tab switch switches undo context only; never records. */
export const APP_NAVIGATION_EXCLUDED_CONTROLLERS = [
  'src/app/app/ribbon/controllers/set-active-tab-controller.ts',
] as const;

/** App color scheme preference — explicitly non-undo per spec. */
export const APP_PREFERENCE_EXCLUDED_CONTROLLERS = [
  'src/app/app/app-shell/controllers/toggle-color-scheme-controller.ts',
  'src/app/app/app-shell/controllers/set-color-scheme-controller.ts',
] as const;

/** Window chrome and developer tooling. */
export const APP_WINDOW_CHROME_EXCLUDED_CONTROLLERS = [
  'src/app/app/window/controllers/close-window-controller.ts',
  'src/app/app/window/controllers/drag-window-controller.ts',
  'src/app/app/window/controllers/maximize-window-controller.ts',
  'src/app/app/window/controllers/minimize-window-controller.ts',
  'src/app/app/window/controllers/restore-window-controller.ts',
  'src/app/app/app-shell/controllers/reload-window-controller.ts',
  'src/app/app/app-shell/controllers/force-reload-window-controller.ts',
  'src/app/app/app-shell/controllers/toggle-dev-tools-controller.ts',
] as const;

/** Menu open/close and styled tooltip show/hide/reposition. */
export const APP_MENUS_TOOLTIPS_EXCLUDED_CONTROLLERS = [
  'src/app/app/menu-bar/controllers/toggle-menu-open-controller.ts',
  'src/app/app/menu-bar/controllers/close-all-menus-controller.ts',
  'src/app/common/styled-tooltip/controllers/show-styled-tooltip-controller.ts',
  'src/app/common/styled-tooltip/controllers/hide-styled-tooltip-controller.ts',
  'src/app/common/styled-tooltip/controllers/reposition-styled-tooltip-controller.ts',
] as const;

/** Transient eyedropper overlay; commit lands in theme controllers (D2). */
export const COMMON_EYEDROPPER_EXCLUDED_CONTROLLERS = [
  'src/app/common/eyedropper-overlay/controllers/open-eyedropper-overlay-controller.ts',
  'src/app/common/eyedropper-overlay/controllers/close-eyedropper-overlay-controller.ts',
  'src/app/common/eyedropper-overlay/controllers/eyedropper-overlay-mouse-move-controller.ts',
  'src/app/common/eyedropper-overlay/controllers/eyedropper-overlay-wheel-scroll-controller.ts',
  'src/app/common/eyedropper-overlay/controllers/eyedropper-overlay-viewport-size-change-controller.ts',
] as const;

/** Action/background queue status — documented architecture exception. */
export const CORE_QUEUE_STATUS_EXCLUDED_CONTROLLERS = [
  'src/app/core/action-queue/controllers/update-action-queue-status-controller.ts',
  'src/app/core/action-queue/controllers/signal-action-queue-processing-complete-controller.ts',
  'src/app/core/background-queue/controllers/update-background-queue-status-controller.ts',
  'src/app/core/background-queue/controllers/signal-background-queue-processing-complete-controller.ts',
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
