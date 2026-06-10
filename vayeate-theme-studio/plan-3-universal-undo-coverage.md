# Plan 3: Universal Undo Coverage — Every User Action Undoable

## Goal

Every completed, state-changing, reversible user action must record an undo
entry. This plan is based on a full audit of all **146** `*-controller.ts`
files under `src/app/**`: catalog (31), template (35), theme (47), and
app/common/core (33). Each controller below is individually classified with
the exact change required. Non-state-changing and non-reversible controllers
are listed with evidence as the documented exclusion inventory.

## Existing pattern (reference)

`src/app/catalog/tokens-card/controllers/update-token-key-controller.ts` is
the canonical recording pattern:

1. Capture `before` — the current entity snapshot from the store
   (`getCurrentCatalog(...)` / `getCurrentTemplate(...)` /
   `themeUiStore.getStore().state.theme`).
2. Run guards/validations; early-return without recording on invalid input,
   no-op, or unchanged value.
3. Build `after` via the domain operation(s).
4. Apply state through the normal mutation path.
5. Call `RecordUndoEntryOperation.execute({ completed: true, description,
   diffs: [{ actionType, target, before, after }], processor })` where
   `processor = createUndoProcessor([{ actionType, apply: (a) =>
   applyXState(a.after), revert: (a) => applyXState(a.before) }])`.

Theme controllers additionally call
`SetCurrentUndoStackIdOperation.executeForContext(deriveUndoContext(...))`
before recording and guard on `edit.changed`.

## Phase A — Shared infrastructure (do first)

### A1. Domain-scoped apply-state helpers

Today `applyCatalogState` lives privately inside `UpdateTokenKeyController`
and `applyTemplateState` is duplicated across the four template controllers
that already record. Extract one helper per business domain so all
controllers and all undo processors share the identical persist path:

- `src/domain/operations/undo-operations/apply-catalog-undo-state-operation.ts`
  — `@singleton() ApplyCatalogUndoStateOperation.execute(catalog: Catalog)`:
  `upsertCatalogs` + `selectCatalog` + `SaveCatalogOperation` +
  `RefreshCatalogRefsAndSelectOperation` (lift the body of
  `UpdateTokenKeyController.applyCatalogState`).
- `src/domain/operations/undo-operations/apply-template-undo-state-operation.ts`
  — same lift from `AddVariableController.applyTemplateState`
  (`updateTemplate` + `selectTemplate` + `SaveTemplateOperation` +
  `RefreshTemplateRefsAndSelectOperation`).
- `src/domain/operations/undo-operations/apply-theme-undo-state-operation.ts`
  — `SetThemeOperation.execute(theme)` +
  `ApplyThemeStateAndSchedulePersistOperation.execute(theme)` (this pair is
  already an allowed operation-to-operation exception per
  `architecture.test.ts`).

These are operations calling operations; verify against the
operation-to-operation `execute` check in
`test/architecture/architecture.test.ts` and extend the documented exception
list there and in `.cursor/rules/app-architecture.mdc` to name these three
undo apply-state helpers (see Phase E).

### A2. Domain-scoped processors and record helpers

Add one recording facade per domain so each controller change is ~5 lines:

- `record-catalog-undo-operation.ts` —
  `RecordCatalogUndoOperation.execute({ description, actionType, target, before, after })`
  builds the diff and a `createUndoProcessor` whose apply/revert call
  `ApplyCatalogUndoStateOperation`. Internally registers **all** `CATALOG_*`
  action types on the processor (one handler map shared per domain) so any
  stack hydrated mid-session can replay any catalog entry.
- `record-template-undo-operation.ts` — same for `TEMPLATE_*` types with
  `ApplyTemplateUndoStateOperation`.
- `record-theme-undo-operation.ts` — same for `THEME_*` types with
  `ApplyThemeUndoStateOperation`. Accepts optional extra diffs for
  multi-entity cases (hue UI state, loaded template — see Theme notes).
- Skip recording (return `not-recorded`) when `before` deep-equals `after`
  to give every wired controller a uniform changed-guard.

### A3. Fix the empty-processor gap

`getActiveUndoStack()` in
`src/domain/operations/undo-operations/undo-operation-helpers.ts` and
`LoadUndoHistoryOperation` / `SetCurrentUndoStackIdOperation` call
`undoManagerV2.getOrCreate(stackId, { processor: createUndoProcessor() })`
with zero handlers. Undo/redo currently work only because
`RecordUndoEntryOperation` previously stored a populated processor for that
stackId. Fix: create a
`buildUniversalUndoProcessor()` factory (in
`src/domain/operations/undo-operations/`) that registers the catalog,
template, and theme handler maps from A2, and use it at all three call sites.
This makes undo/redo/goto work even when a stack is reloaded from disk before
any new entry is recorded in that context.

### A4. Action-type constants

Create `src/model/undo-action-types.ts` exporting the `CATALOG_*`,
`TEMPLATE_*`, `THEME_*` constants listed below, replacing the current inline
string literals in the 8 existing recording controllers.

## Phase B — Catalog controllers (31 audited)

### B1. Already records (1) — migrate to shared helpers only

| Controller | Change |
|---|---|
| `src/app/catalog/tokens-card/controllers/update-token-key-controller.ts` | Replace private `applyCatalogState` + inline processor with `RecordCatalogUndoOperation`; keep guards (`!trimmedNewKey`, `newKey === oldKey`, `!tokenExists`). |

### B2. Add recording (16)

For each: capture `before = catalog` at the listed line (post-guards), build
`after = updated`, then `RecordCatalogUndoOperation.execute(...)` after the
save/refresh calls. All follow `BumpCatalogVersionForEditOperation` →
transform → `SaveCatalogOperation` → `RefreshCatalogRefsAndSelectOperation`
unless noted.

| Controller | before / after capture | actionType | description | target |
|---|---|---|---|---|
| `bulk-add-dialog/controllers/bulk-add-tokens-controller.ts` | `catalog` L31-33; `updated` L39 (guards: empty text, parse error, `unique.length === 0`) | `CATALOG_TOKENS_BULK_ADDED` | `Bulk add {N} catalog tokens` | `{name}@{version}` |
| `catalog-details-card/controllers/add-new-source-controller.ts` | `catalog` L28; `updated` L37 (guard: empty trimmed url) | `CATALOG_SOURCE_ADDED` | `Add catalog source {url}` | `{name}@{version}:source:{url}` |
| `catalog-details-card/controllers/remove-source-controller.ts` | `catalog` L25; `updated` L28 | `CATALOG_SOURCE_REMOVED` | `Remove catalog source` | `{name}@{version}:source:{index}` |
| `catalog-details-card/controllers/update-source-url-controller.ts` | `catalog` L25; `updated` L28 | `CATALOG_SOURCE_URL_UPDATED` | `Update catalog source URL` | `{name}@{version}:source:{index}` |
| `catalog-details-card/controllers/update-source-type-controller.ts` | `catalog` L26; `updated` L29 | `CATALOG_SOURCE_TYPE_UPDATED` | `Update catalog source type` | `{name}@{version}:source:{index}` |
| `catalog-details-card/controllers/update-source-token-type-controller.ts` | `catalog` L26; `updated` L29 | `CATALOG_SOURCE_TOKEN_TYPE_UPDATED` | `Update catalog source token type` | `{name}@{version}:source:{index}` |
| `catalog-details-card/controllers/lock-catalog-controller.ts` | `catalog` L23 (guard: `validateCanLockCatalog`); `updated` L25; no version bump | `CATALOG_LOCKED` | `Lock catalog {name}` | `{name}@{version}` |
| `catalog-details-card/controllers/sync-catalog-controller.ts` | `catalog` L23 (guard: remote type); `synced` L26 | `CATALOG_SYNCED` | `Sync catalog {name} from sources` | `{name}@{version}` |
| `tokens-card/controllers/add-new-token-controller.ts` | `catalog` L30; `merged` L36-37 or `updated` L46 (semantic branch guard `!merged`) | `CATALOG_TOKEN_ADDED` | `Add {tokenType} token {key}` / `Add semantic token {key}` | `{name}@{version}:{tokenType}:{key}` |
| `tokens-card/controllers/remove-token-controller.ts` | `catalog` L24; `updated` L27 | `CATALOG_TOKEN_REMOVED` | `Remove {tokenType} token {key}` | `{name}@{version}:{tokenType}:{key}` |
| `tokens-card/controllers/add-catalog-semantic-token-selector-controller.ts` | `catalog` L26; `merged` L31 (guard `!merged`) | `CATALOG_SEMANTIC_SELECTOR_ADDED` | `Add semantic selector {selector}` | `{name}@{version}:semantic:{selector}` |
| `tokens-card/controllers/remove-semantic-token-list-item-controller.ts` | `catalog` L24; `updated` L27 | `CATALOG_SEMANTIC_REGISTRY_ITEM_REMOVED` | `Remove semantic {kind} entry` | `{name}@{version}:{kind}:{index}` |
| `tokens-card/controllers/update-semantic-token-registry-text-controller.ts` | `catalog` L24; `updated` L27 (add changed-guard: skip when operation returns identical registry) | `CATALOG_SEMANTIC_REGISTRY_TEXT_UPDATED` | `Update semantic {kind} entry` | `{name}@{version}:{kind}:{index}` |
| `catalog-details-card/controllers/revert-catalog-to-version-controller.ts` | `snapshot` L31 + optional `highestCatalog` L35-39; after = `toLock` (L42) and `reverted` (L49). Record **two diffs** in one entry: `CATALOG_LOCKED` (when head was locked) + `CATALOG_REVERTED_TO_VERSION`. Revert must delete/overwrite the created reverted version and restore the head's lock state via `ApplyCatalogUndoStateOperation` per diff. | `CATALOG_REVERTED_TO_VERSION` | `Revert catalog {name} to {snapshot.version}` | `{name}@{snapshot.version}->{newVersion}` |
| `catalog-details-card/controllers/delete-current-catalog-version-controller.ts` | Capture full deleted `Catalog` + prior `selectedRef` before `DeleteCatalogOperation` (L20-23); after = absence + `next` ref (L27-32). Revert re-saves the captured catalog and restores selection; apply re-deletes. Needs a dedicated handler pair (not plain apply-state): `apply: deleteCatalog + select next`, `revert: saveCatalog(before) + select before-ref`. | `CATALOG_VERSION_DELETED` | `Delete catalog {name}@{version}` | `{name}@{version}` |
| `create-dialog/controllers/close-catalog-create-dialog-controller.ts` (OK path only) | before = absence of `{name}@1.0.0` + prior `selectedRef`; after = `ref` returned by `CreateCatalogOperation` L25. Revert deletes the created catalog version and restores prior selection; apply re-creates it (capture the created `Catalog` object for re-save). Cancel path records nothing. Fix noted bug: controller passes `'OK'` unconditionally at L19 — route the real `outcome`. | `CATALOG_CREATED` | `Create catalog {name}` | `{name}@1.0.0` |

### B3. Excluded — non-state-changing (13), with evidence

| Controller | Evidence |
|---|---|
| `bulk-add-dialog/controllers/open-bulk-add-dialog-controller.ts` | Dialog open + text reset only. |
| `bulk-add-dialog/controllers/close-bulk-add-dialog-controller.ts` | Dialog close + text clear only. |
| `bulk-add-dialog/controllers/set-catalog-bulk-add-text-controller.ts` | Input staging, committed by bulk-add. |
| `catalog-details-card/controllers/set-catalog-new-source-token-type-controller.ts` | Staging fields on `CatalogUiStore`. |
| `catalog-details-card/controllers/set-catalog-new-source-type-controller.ts` | Staging field only. |
| `catalog-details-card/controllers/set-catalog-new-source-url-controller.ts` | Staging field only. |
| `catalogs-card/controllers/set-selected-catalog-controller.ts` | Selection/navigation; switches undo context via `SetCurrentUndoStackIdOperation`. |
| `create-dialog/controllers/open-catalog-create-dialog-controller.ts` | Dialog open only. |
| `create-dialog/controllers/set-catalog-create-dialog-name-controller.ts` | Dialog staging + inline validation errors. |
| `create-dialog/controllers/set-catalog-create-dialog-type-controller.ts` | Dialog staging only. |
| `tokens-card/controllers/set-catalog-new-semantic-token-selector-text-controller.ts` | Staging field only. |
| `tokens-card/controllers/set-catalog-new-token-key-controller.ts` | Staging field only. |
| `tokens-card/controllers/set-catalog-tokens-search-text-controller.ts` | Search filter only. |

### B4. Excluded — lifecycle (1)

| Controller | Evidence |
|---|---|
| `catalog-page/controllers/load-catalog-page-controller.ts` | `CATALOG_PAGE_ON_LOAD` hydration (`LoadCatalogRefsOperation`); no user edit. |

## Phase C — Template controllers (35 audited)

### C1. Already records (4) — migrate to shared helpers only

`variables-card/controllers/add-variable-controller.ts`,
`add-color-variable-controller.ts`,
`groups-card/controllers/add-group-controller.ts`,
`add-group-and-clear-input-controller.ts`: replace duplicated
`applyTemplateState` + inline processors with `RecordTemplateUndoOperation`;
keep existing guards and the `TEMPLATE_COLOR_VARIABLE_ADDED` /
`TEMPLATE_CONTRAST_VARIABLE_ADDED` / `TEMPLATE_GROUP_ADDED` types.

### C2. Add recording (13 wired controllers)

Standard shape: `before = template` from `getCurrentTemplate(...)`, `after =
next` from the domain operation, record after save/refresh.

| Controller | before / after, guards | actionType | description | target |
|---|---|---|---|---|
| `variables-card/controllers/remove-variable-controller.ts` | `template` L25-26; `next` L30/L37; guard `ValidateCanRemoveVariable` | `TEMPLATE_COLOR_VARIABLE_REMOVED` / `TEMPLATE_CONTRAST_VARIABLE_REMOVED` (branch on kind) | `Remove {key} variable` | `{name}@{version}:variable:{key}` |
| `variables-card/controllers/update-variable-group-ref-controller.ts` | `template` L21; `next` L24 | `TEMPLATE_VARIABLE_GROUP_REF_UPDATED` | `Set {key} group` | `{name}@{version}:variable:{key}:group` |
| `variables-card/controllers/update-contrast-comparison-source-controller.ts` | `template` L25; `next` L32 | `TEMPLATE_CONTRAST_COMPARISON_SOURCE_UPDATED` | `Set {key} comparison source` | `{name}@{version}:contrast-variable:{key}:comparison-source` |
| `groups-card/controllers/remove-group-controller.ts` | `template` L22; `next` L27; guards `inUse.has(groupId)` | `TEMPLATE_GROUP_REMOVED` | `Remove group {groupId}` | `{name}@{version}:group:{groupId}` |
| `mappings-card/controllers/add-semantic-variant-controller.ts` | `template` L27; `next` L45-50 (multi-field: mappings + semantic sets — full Template snapshot covers it) | `TEMPLATE_SEMANTIC_VARIANT_ADDED` | `Add semantic variant {key}` | `{name}@{version}:semantic:{key}` |
| `mappings-card/controllers/remove-mapping-controller.ts` | `template` L22; `next` L26 | `TEMPLATE_MAPPING_REMOVED` | `Remove mapping {tokenKey}` | `{name}@{version}:mapping:{tokenType}:{tokenKey}` |
| `mappings-card/controllers/update-semantic-variant-key-controller.ts` | `template` L49; `next` L60-66; guards: parse failure, `newKey === oldKey`, duplicate | `TEMPLATE_SEMANTIC_VARIANT_KEY_UPDATED` | `Rename semantic variant {oldKey} to {newKey}` | `{name}@{version}:semantic:{oldKey}` |
| `mappings-card/controllers/set-mapping-color-ref-controller.ts` | `template` L33; `next` L44/L49; two behaviors: set ref vs remove orphan — record `TEMPLATE_MAPPING_COLOR_REF_SET` or `TEMPLATE_MAPPING_REMOVED` per branch | per branch | `Set {tokenKey} color variable` / `Remove orphan mapping {tokenKey}` | `{name}@{version}:mapping:{tokenType}:{tokenKey}:color` |
| `mappings-card/controllers/set-mapping-contrast-ref-controller.ts` | `template` L26; `next` L30 | `TEMPLATE_MAPPING_CONTRAST_REF_SET` | `Set {tokenKey} contrast variable` | `{name}@{version}:mapping:{tokenType}:{tokenKey}:contrast` |
| `mappings-card/controllers/set-mapping-group-ref-controller.ts` | standard | `TEMPLATE_MAPPING_GROUP_REF_SET` | `Set {tokenKey} mapping group` | `{name}@{version}:mapping:{tokenType}:{tokenKey}:group` |
| `template-catalogs-card/controllers/toggle-catalog-controller.ts` | `template` L48; `updated` L88-95; guards: no versions when including; async catalog load happens before `after` is built — record only after `updated` exists | `TEMPLATE_CATALOG_TOGGLED` | `Include catalog {catalogName}` / `Exclude catalog {catalogName}` | `{name}@{version}:catalog:{catalogName}` |
| `template-catalogs-card/controllers/change-catalog-version-controller.ts` | `template` L45; `updated` L58-65 | `TEMPLATE_CATALOG_VERSION_CHANGED` | `Change {catalogName} to {newVersion}` | `{name}@{version}:catalog:{catalogName}` |
| `template-details-card/controllers/lock-template-controller.ts` | `template` L21; `updated` L23; guard `ValidateCanLockTemplate`; no bump | `TEMPLATE_LOCKED` | `Lock template {name}` | `{name}@{version}` |
| `template-catalogs-card/controllers/update-all-catalogs-controller.ts` | `template` L29; `updated` L58-65; add changed-guard (skip when all refs already latest) | `TEMPLATE_CATALOGS_ALL_UPDATED` | `Update all catalogs to latest` | `{name}@{version}:catalogs` |

### C3. Create / delete (2) — entity lifecycle entries

| Controller | Change |
|---|---|
| `create-template-dialog/controllers/create-template-controller.ts` | Record `TEMPLATE_CREATED` (`Create template {name}`, target `{name}@{initialVersion}`). before = absence + prior `selectedRef`; after = `newTemplate` L29. Dedicated handler: revert deletes the created version (`DeleteTemplateOperation`) + restores prior selection; apply re-saves the captured `newTemplate` + selects it. |
| `template-details-card/controllers/delete-current-template-version-controller.ts` | Record `TEMPLATE_VERSION_DELETED` (`Delete template {name}@{version}`). Capture full `Template` + `selectedRef` before `DeleteTemplateOperation`. Dedicated handler mirrors catalog delete: revert re-saves the snapshot + refreshes refs + reselects; apply re-deletes. (Reclassified from non-reversible: the full snapshot exists in the store before deletion, so it is reversible.) |

### C4. Unwired duplicates (5) — align or delete

`add-contrast-variable-controller.ts`, `remove-color-variable-controller.ts`,
`remove-contrast-variable-controller.ts` (no handler wiring; superseded by
`AddVariableController` / `RemoveVariableController`): either delete them or
migrate to `RecordTemplateUndoOperation` so they cannot drift. The audit also
flags `add-color-variable-controller.ts` and `add-group-controller.ts` as
test-only; keep them but migrate (C1). Decide deletion vs migration during
implementation; do not leave non-recording mutating controllers in the tree.

### C5. Undo infrastructure (1)

`template-page/controllers/restore-template-state-controller.ts` — legacy
snapshot-restore path, not handler-wired. **Delete it** (with its `types.ts`
references `TemplateUndoPush` / `CatalogUndoPush` legacy types) — the
directive forbids preserving placeholder undo behavior. Never records.

### C6. Excluded — non-state-changing (11), with evidence

| Controller | Evidence |
|---|---|
| `variables-card/controllers/set-template-add-variable-name-controller.ts` | Draft input staging. |
| `variables-card/controllers/set-variables-search-text-controller.ts` | Search filter. |
| `groups-card/controllers/set-template-add-group-name-controller.ts` | Draft input staging. |
| `mappings-card/controllers/set-mapping-search-text-controller.ts` | Search filter. |
| `mappings-card/controllers/set-mapping-color-variable-filter-controller.ts` | UI filter selection. |
| `mappings-card/controllers/set-mapping-contrast-variable-filter-controller.ts` | UI filter selection. |
| `create-template-dialog/controllers/set-create-form-name-controller.ts` | Dialog staging. |
| `create-template-dialog/controllers/open-create-dialog-controller.ts` | Dialog open + form reset. |
| `create-template-dialog/controllers/close-create-dialog-controller.ts` | Dialog close. |
| `templates-card/controllers/select-template-and-load-controller.ts` | Selection/navigation; switches undo context. |
| `template-page/controllers/load-template-page-controller.ts` | Lifecycle hydration. |

## Phase D — Theme controllers (47 audited)

### D1. Already records (3) — migrate to shared helpers only

`theme-palette-card/controllers/assign-color-from-picker-controller.ts`,
`theme-variables-card/controllers/set-color-variable-light-controller.ts`,
`set-color-variable-dark-controller.ts`: replace inline processors with
`RecordThemeUndoOperation`; keep `edit.changed` guards and existing
`THEME_PALETTE_COLOR_ASSIGNED` / `THEME_COLOR_VARIABLE_LIGHT_SET` /
`THEME_COLOR_VARIABLE_DARK_SET` types.

### D2. Eyedropper commit gap (2)

| Controller | Change |
|---|---|
| `theme-palette-card/controllers/commit-assign-color-eye-dropper-controller.ts` | Uses the same `CommitAssignColorTextOperation` as the picker but never records. Add recording identical to `AssignColorFromPickerController` (guard `edit.changed`), `THEME_PALETTE_COLOR_ASSIGNED`, description `Assign palette color (eyedropper)`. Alternatively delegate to a shared private helper extracted with D1. |
| `theme-palette-card/controllers/commit-hue-reference-eye-dropper-color-controller.ts` | Same recording as `CommitHueReferenceColorController` (D3 row) — share one helper. |

### D3. Add recording — standard Theme snapshot (12)

All follow: `before = themeUiStore.getStore().state.theme`, `after = next`,
mutate via `SetThemeOperation` + `ApplyThemeStateAndSchedulePersistOperation`,
then `RecordThemeUndoOperation` (which skips when before deep-equals after —
these controllers currently have **no** changed-guard, so the helper guard is
required to avoid no-op entries).

| Controller | actionType | description |
|---|---|---|
| `theme-variables-card/controllers/set-contrast-variable-light-value-controller.ts` | `THEME_CONTRAST_VARIABLE_LIGHT_VALUE_SET` | `Set contrast light value` |
| `theme-variables-card/controllers/set-contrast-variable-light-min-controller.ts` | `THEME_CONTRAST_VARIABLE_LIGHT_MIN_SET` | `Set contrast light min` |
| `theme-variables-card/controllers/set-contrast-variable-light-max-controller.ts` | `THEME_CONTRAST_VARIABLE_LIGHT_MAX_SET` | `Set contrast light max` |
| `theme-variables-card/controllers/set-contrast-variable-light-method-controller.ts` | `THEME_CONTRAST_VARIABLE_LIGHT_METHOD_SET` | `Set contrast light method` |
| `theme-variables-card/controllers/set-contrast-variable-dark-value-controller.ts` | `THEME_CONTRAST_VARIABLE_DARK_VALUE_SET` | `Set contrast dark value` |
| `theme-variables-card/controllers/set-contrast-variable-dark-min-controller.ts` | `THEME_CONTRAST_VARIABLE_DARK_MIN_SET` | `Set contrast dark min` |
| `theme-variables-card/controllers/set-contrast-variable-dark-max-controller.ts` | `THEME_CONTRAST_VARIABLE_DARK_MAX_SET` | `Set contrast dark max` |
| `theme-variables-card/controllers/set-contrast-variable-dark-method-controller.ts` | `THEME_CONTRAST_VARIABLE_DARK_METHOD_SET` | `Set contrast dark method` |
| `theme-variables-card/controllers/set-contrast-use-dark-for-light-controller.ts` | `THEME_CONTRAST_USE_DARK_FOR_LIGHT_SET` | `Toggle contrast use dark for light` |
| `theme-variables-card/controllers/set-color-use-dark-for-light-controller.ts` | `THEME_COLOR_USE_DARK_FOR_LIGHT_SET` | `Toggle color use dark for light` |
| `theme-palette-card/controllers/set-apply-palette-to-light-controller.ts` | `THEME_PALETTE_APPLY_TO_LIGHT_SET` | `Toggle apply palette to light` |
| `theme-palette-card/controllers/set-apply-palette-to-dark-controller.ts` | `THEME_PALETTE_APPLY_TO_DARK_SET` | `Toggle apply palette to dark` |

Target for all: `{theme.name}@{theme.version}:{ref or field}`.

Also: `theme-palette-card/controllers/set-palette-cluster-count-k-controller.ts`
(`THEME_PALETTE_CLUSTER_COUNT_SET`, `Set palette cluster count`) — this is the
slider **commit**; the `-preview-` controller stays excluded.

### D4. Add recording — multi-entity diffs (4)

These mutate `Theme` plus `ThemeUiStore` palette/UI fields. Extend
`RecordThemeUndoOperation` to accept an extra diff with its own actionType and
register handlers for the UI fields (`SetThemeHueReferenceHexOperation`,
`SetThemeHueAdjustmentOperation`, `SetThemeLoadedTemplateOperation`):

| Controller | Diffs | actionType(s) | description |
|---|---|---|---|
| `theme-palette-card/controllers/recenter-hue-reference-controller.ts` | Theme (`colorAssignments`) + `hueAdjustment` (before value -> 0); guard: skip when `hueAdjustment === 0` | `THEME_PALETTE_HUE_RECENTERED` (+ `THEME_PALETTE_HUE_ADJUSTMENT_SET`) | `Recenter hue reference` |
| `theme-palette-card/controllers/commit-hue-reference-color-controller.ts` | `hueReferenceHex` + `hueAdjustment` before/after (UI-store-only; no Theme diff) | `THEME_PALETTE_HUE_REFERENCE_SET` | `Set hue reference color` |
| `theme-details-card/controllers/set-theme-template-controller.ts` | Theme (templateRef + merged assignments) + loaded template (`SetThemeLoadedTemplateOperation` before/after) | `THEME_TEMPLATE_SET` | `Change theme template` |
| `theme-details-card/controllers/set-theme-preview-token-ref-controller.ts` | Theme (`tokenRefField`) + `hueReferenceHex` + `hueAdjustment` | `THEME_PREVIEW_TOKEN_REF_SET` | `Set preview token ref` |

### D5. Entity lifecycle (3) — dedicated handlers (same pattern as B2/C3 delete-create)

| Controller | Change |
|---|---|
| `theme-details-card/controllers/increment-theme-version-controller.ts` | Record `THEME_VERSION_INCREMENTED` (`Increment theme version`). before = pre-bump `selectedRef` + absence of new version; after = bumped `Theme` + new selection. Revert deletes the new version file (`DeleteThemeOperation`) and reselects the prior version; apply re-saves the bumped theme. Note: this action changes the `themeRef` and therefore the undo **context key**; record the entry in the pre-increment context (capture stack id before switching). Validate this UX during implementation — if cross-context confusion arises, record in both old context and document the choice. |
| `theme-details-card/controllers/delete-theme-version-controller.ts` | Record `THEME_VERSION_DELETED` (`Delete theme {name}@{version}`). Capture full `Theme` before `DeleteThemeOperation`; revert re-saves + reloads refs + reselects; apply re-deletes. Same context-key caveat as above. |
| `create-theme-dialog/controllers/create-theme-controller.ts` | Record `THEME_CREATED` (`Create theme {name}`). before = absence; after = created `Theme`. Revert deletes the created file + clears/restores selection; apply re-saves. |

### D6. Excluded — non-state-changing (17), with evidence

| Controller | Evidence |
|---|---|
| `themes-card/controllers/select-theme-and-load-controller.ts` | Selection/navigation; switches undo context. |
| `themes-card/controllers/select-theme-by-name-controller.ts` | Selection/navigation. |
| `themes-card/controllers/open-theme-create-dialog-controller.ts` | Dialog open. |
| `create-theme-dialog/controllers/close-theme-create-dialog-controller.ts` | Dialog close. |
| `create-theme-dialog/controllers/set-theme-create-form-name-controller.ts` | Dialog staging. |
| `theme-page/controllers/load-theme-page-controller.ts` | Lifecycle hydration. |
| `theme-page/controllers/clear-theme-save-error-controller.ts` | Error banner dismiss (UI only). |
| `editor-previews-card/controllers/load-theme-previews-controller.ts` | Preview cache load. |
| `theme-variables-card/controllers/toggle-variable-selection-controller.ts` | Pane checkbox selection. |
| `theme-variables-card/controllers/set-variables-select-by-type-controller.ts` | Pane selection. |
| `theme-variables-card/controllers/set-variables-select-by-group-controller.ts` | Pane selection. |
| `theme-variables-card/controllers/set-variables-select-all-controller.ts` | Pane selection. |
| `theme-variables-card/controllers/set-theme-variables-search-text-controller.ts` | Search filter. |
| `theme-palette-card/controllers/set-color-refs-selection-batch-controller.ts` | Pane selection batch. |
| `theme-palette-card/controllers/set-assign-color-preview-controller.ts` | Live preview, explicitly no persist. |
| `theme-palette-card/controllers/set-palette-cluster-count-k-preview-controller.ts` | Slider drag preview, no persist. |
| `theme-palette-card/controllers/set-theme-hue-adjustment-controller.ts` | Transient slider adjustment (committed by recenter). |

### D7. Excluded — internal/infrastructure/non-reversible (5)

| Controller | Classification + evidence |
|---|---|
| `theme-palette-card/controllers/persist-current-theme-controller.ts` | Internal follow-up: re-persists unchanged theme on picker close; no state delta. Never records. |
| `theme-page/controllers/restore-theme-state-controller.ts` | Legacy undo-restore infrastructure, not a user action. **Delete** along with C5 if unreferenced after migration; otherwise document as processor-internal. |
| `theme-details-card/controllers/generate-theme-controller.ts` | Non-reversible: exports JSON files to user-chosen filesystem location; no app-state mutation beyond `generateResult` status. |
| `theme-palette-card/controllers/set-theme-pane-selections-controller.ts` | Unwired thin wrapper over pane selection. Delete or leave excluded (selection-only). |
| `theme-palette-card/controllers/set-theme-hue-reference-hex-controller.ts` | Unwired thin wrapper. Delete or leave excluded (superseded by `CommitHueReferenceColorController`). |

## Phase E — App shell, common, core (33 audited): zero recording changes

No controller in `src/app/app/`, `src/app/common/`, or `src/app/core/`
records undo entries. Documented exclusion inventory:

- **Undo infrastructure (never record):** `undo-controller.ts`,
  `redo-controller.ts`, `history-go-to-controller.ts`
  (`src/app/core/undo/`), `handle-keyboard-shortcut-controller.ts`.
- **Lifecycle:** `load-app-controller.ts` (clears persisted undo on startup),
  `unload-app-controller.ts`, `bootstrap-app-controller.ts`,
  `initialize-window-callbacks-controller.ts`.
- **Navigation/context:** `set-active-tab-controller.ts` (switches undo
  context only, never records).
- **App preference (explicitly non-undo per spec):**
  `toggle-color-scheme-controller.ts`, `set-color-scheme-controller.ts`.
- **Window chrome:** close/drag/maximize/minimize/restore window controllers,
  `reload-window-controller.ts`, `force-reload-window-controller.ts`,
  `toggle-dev-tools-controller.ts`.
- **Menus/tooltips:** `toggle-menu-open-controller.ts`,
  `close-all-menus-controller.ts`, three styled-tooltip controllers.
- **Eyedropper overlay:** open/close/mouse-move/wheel/viewport controllers —
  transient overlay; the commit lands in theme controllers (D2).
- **Queue status:** four action/background queue status controllers
  (documented architecture exception).

## Phase F — Enforcement, directives, and cleanup

1. **Coverage enforcement test** — extend
   `test/architecture/component-workflow-compliance.test.ts` (or add a new
   architecture test): every `*-controller.ts` under `src/app/**` must either
   (a) import `Record*UndoOperation` / `RecordUndoEntryOperation`, or (b)
   appear in an explicit exclusion list checked into the test (the
   inventories in B3/B4, C6, D6/D7, E). New mutating controllers then fail
   the test until classified.
2. **Architecture test exceptions** — update the operation-to-operation
   `execute` exception list in `test/architecture/architecture.test.ts` and
   the matching bullets in `.cursor/rules/app-architecture.mdc` to name the
   three `Apply*UndoStateOperation` helpers and the `Record*UndoOperation`
   facades.
3. **Legacy cleanup** — delete `RestoreTemplateStateController`,
   `RestoreThemeStateController` (if unreferenced after migration), legacy
   `CatalogUndoPush` / `TemplateUndoPush` types in
   `catalog-operations/types.ts` / `template-operations/types.ts`, and the
   unwired duplicate controllers chosen for deletion in C4/D7.
4. **Spec sync** — update `specs/004-add-undo-functionality/spec.md`,
   `tasks.md`, and `contracts/undo-workflow-integration.md` to state
   universal coverage (all state-changing reversible controllers record;
   exclusions inventoried with evidence), and refresh the AGENTS.md SPECKIT
   directive (representative workflows -> universal coverage with documented
   exclusions).

## Phase G — Tests and validation

1. **Unit:** tests for the three `Apply*UndoStateOperation` helpers, the
   `Record*UndoOperation` facades (records on change, skips on deep-equal,
   skips on missing context), and `buildUniversalUndoProcessor` (replays
   every registered actionType).
2. **Renderer workflows:** extend
   `catalog-renderer-workflows.test.tsx`, `template-renderer-workflows.test.tsx`,
   `theme-renderer-workflows.test.tsx` with undo/redo round-trips for at least
   one controller from each new group: catalog source edit, catalog token
   remove, catalog sync, catalog delete/create; template mapping ref set,
   group remove, catalog toggle, template create/delete; theme contrast field
   set, use-dark-for-light toggle, hue recenter, eyedropper assign, theme
   version increment/delete/create.
3. **Failure paths:** assert no entry recorded for: invalid input
   (empty key), no-op edits (same value), validation rejections
   (`ValidateCanRemoveVariable` false), and operation failures.
4. **Branch pruning + persistence regression:** after the rollout, re-run
   existing `undo-stack.test.ts` and `undo-manager-v2.test.ts` plus the
   startup-clearing tests unchanged.
5. **Commands:** `npm run lint`, `npx vitest run test/architecture`,
   `npx vitest run` (full), and manual smoke across all four tabs.

## Suggested implementation order

1. Phase A (infrastructure) with unit tests.
2. Phase B2 simple rows (source/token edits) to prove the facade, then B2
   complex rows (revert/delete/create).
3. Phase C2/C3, then C1/C4/C5 migration + cleanup.
4. Phase D3 batch (mechanical), D2, D4, D5, then D1 migration.
5. Phase F enforcement + directive sync.
6. Phase G full validation.
