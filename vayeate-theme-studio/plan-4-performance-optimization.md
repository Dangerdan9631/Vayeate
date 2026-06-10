# Plan 4: Performance Optimization — Keep the UI Interactive

## Goal

Reduce input latency and main-thread jank in Theme Studio without changing
observable behavior or violating the architecture rules in `.cursor/rules/`
or the specifications in `specs/`. Focus areas, in priority order:

1. Action queue: coalescing/batching high-frequency actions and not blocking
   the queue on slow async work.
2. Parallelizing independent background work.
3. Offloading long-running CPU work to real background threads (Web Workers).
4. Memory-authoritative data: persist on modification, but stop re-reading
   from disk when the in-memory store is already fresh.

## Audit summary (current state)

- `ActionQueue` (`src/app/core/action-queue/action-queue.ts`) is a strict
  serial FIFO on the renderer main thread. One action is fully `await`ed
  before the next; there is **no coalescing**, so slider drags, color-picker
  previews, search keystrokes, and eyedropper moves each enqueue one action
  per event and can backlog behind slow actions.
- Several controllers `await` disk/CPU work **on the action path**: undo
  stack persist on every push (`undo-manager-v2.ts` `onAfterChange`),
  eyedropper snapshot capture on overlay open, undo stack hydration on tab
  switch.
- The "worker" background queue (`pooled-queue.ts`) is a pooled async
  scheduler on the **main thread** — no Web Workers or Electron utility
  processes exist anywhere. It also polls with `setTimeout(100)`.
- Every `ThemeUiStore` write funnels through `deriveThemePaneFields`
  (O(all color assignments) + sorts), even for search-text-only updates.
  Hue slider, color-picker preview, and cluster-K preview all trigger it per
  event, and `EditorPreviewsCard` then re-resolves **every token of every
  preview** (including contrast math) on each change.
- Catalog/template mutations write to disk immediately, then **re-list the
  directory and re-load the just-saved file** via
  `RefreshCatalogRefsAndSelectOperation`. Theme selection re-reads from disk
  and then schedules a redundant persist of identical data. Undo stacks are
  rewritten in full (up to 999 frames) on every change.

Each task below is discrete and independently removable. Dependencies between
tasks are called out explicitly. Tasks are grouped into sections; within a
section they are ordered by expected impact.

---

## Section A — Action queue: coalescing and non-blocking dispatch

### Task A1: Coalescing policy for high-frequency actions in `ActionQueue`

**Problem.** Fast hue-slider drags, cluster-K drags, native color-picker
`onInput` previews, search keystrokes, eyedropper pointer moves, viewport
resizes, and tooltip repositions each enqueue one action per event. The
serial queue processes every stale intermediate value, each of which can run
`deriveThemePaneFields` and fan out to preview re-resolution.

**Change.** Add a declarative coalescing policy to the action queue with two
distinct merge strategies. On `enqueue`, when the incoming action's type
(+optional key) matches a pending queued action, the policy merges them
instead of appending. The currently-processing action is never touched, so
ordering and at-least-once delivery of the final value are preserved.

#### Strategy 1 — Latest-only (replace)

Used for actions whose payload is an **absolute value** — replacing a queued
pending action with the newest is lossless because only the final value
matters.

- `THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT` (live preview; `value` is
  the current absolute hex color)
- `APP_EYEDROPPER_OVERLAY_MOUSE_MOVE` (absolute pointer position)
- `APP_EYEDROPPER_OVERLAY_VIEWPORT_SIZE_CHANGE` (absolute dimensions)
- `APP_STYLED_TOOLTIP_ON_POSITION_CHANGE` (absolute position)
- `*_SEARCH_TEXT_ON_CHANGE` / dialog `*_TEXT_ON_CHANGE` types (each action
  carries the full current text string, keyed per control)

#### Strategy 2 — Sum-deltas (accumulate)

Used for actions whose `value` payload is an **incremental delta** — the
pending action's value is summed with the incoming delta so no accumulated
change is lost. The merged action retains all other fields from the
most-recent action.

- `THEME_PALETTE_HUE_SLIDER_ON_DELTA` (`value` is a hue increment; dropping
  or replacing intermediates would silently discard accumulated movement)
- `THEME_PALETTE_CLUSTER_COUNT_SLIDER_ON_DELTA` (same; cluster-K increment)

**Prerequisite check.** Before implementation, verify the component dispatch
sites for both delta types: the payload must be a true relative increment
(not the raw absolute `e.target.value` from the range input). If either
currently dispatches the absolute slider position, the dispatch site must be
updated to compute the delta (current value minus the last-dispatched value)
before this task is complete. That change is a dispatch-site fix on the UI
side and does not affect the action type definition, handler, controller, or
operation.

Commit-style actions (`*_ON_COMMIT`, `*_ON_CLOSE`, undo-recording actions)
are **never** coalesced.

**Files.**
- `src/app/core/action-queue/action-queue.ts` — coalescing logic in
  `enqueue`.
- New `src/app/core/action-queue/action-coalescing-policy.ts` — type list,
  strategy assignment, key extractors, and the two merge functions
  (`mergeLatest`, `mergeSumDelta`). Cohesive module; may export related
  types and pure helpers.
- Dispatch sites for `HueSliderOnDelta` and `ClusterCountSliderOnDelta` in
  `use-theme-palette-card-viewmodel.ts` / `ThemePaletteCard.tsx` if the
  prerequisite check finds absolute values being sent.
- `src/app/core/queues/baseline-queues.test.ts` (or a sibling test) — encode
  both behaviors: latest-only replaces, sum-deltas accumulates, ordering
  preserved, non-listed types unaffected.

**Architecture compliance.** All actions still flow UI → queue → handler →
controller → operation. Coalescing is queue infrastructure, not business
logic. Payload shapes are unchanged except where the dispatch-site fix moves
the delta computation from the store to the viewmodel (still UI-layer; still
a user-input value).

**Risk.** Low–medium. The sum-deltas prerequisite check is the main risk:
confirm whether `HueSliderOnDelta` and `ClusterCountSliderOnDelta` currently
carry true increments or absolute slider positions before coding the merge
function. Undo coalescing (`coalesceWithPrevious`) already merges adjacent
frames, so fewer intermediate actions does not change undo semantics.

---

### Task A2: Stop blocking the action queue on the eyedropper snapshot load

**Problem.** `OpenEyedropperOverlayController` `await`s
`loadEyedropperSnapshot.execute()` (screen capture + `createImageBitmap` per
display) before returning. Every action dispatched while the overlay opens
stalls behind it.

**Change.** Open the overlay immediately with a `loading` snapshot state in
`EyedropperUiStore`; enqueue the snapshot load on the `worker` background
queue (via the existing `EnqueueBackgroundQueueActionOperation` bridge) and
have the load operation write the snapshot into the store when ready. The
overlay already renders from store state, so it shows a brief loading state
instead of freezing the queue.

**Files.**
- `src/app/common/eyedropper-overlay/controllers/open-eyedropper-overlay-controller.ts`
- `src/domain/operations/.../load-eyedropper-snapshot-operation.ts`
- `EyedropperOverlay.tsx` / its viewmodel — render the loading state
  (UI-only; no business logic in the component).

**Architecture compliance.** Uses the documented
`EnqueueBackgroundQueueActionOperation` exception; no controller-to-
controller calls; state writes stay in operations.

**Risk.** Low. Pointer-move actions arriving before the snapshot exists must
no-op gracefully (verify `UpdateEyedropperPointerOperation` handles a null
snapshot).

---

### Task A3: Move undo-stack persistence off the action path

**Problem.** Every undo push/undo/redo/goto awaits a full-stack
`JSON.stringify` + IPC file write inside `onAfterChange`
(`src/domain/core/undo-manager-v2.ts`), inside the action being processed.
Committing a palette color blocks all subsequent actions on disk I/O.

**Change.** Make `onAfterChange` schedule the persist on the `data_io`
background queue (per-stack, latest-write-wins: if a persist for the same
`stackId` is already pending, replace its payload) instead of awaiting
inline. The stack is still written to disk on every change — just
asynchronously and coalesced — and LRU eviction (`release`) still awaits its
persist before dropping the stack from memory so disk is consistent before
memory is discarded.

**Spec note.** The 004 undo contract requires "stack changes are written to
disk" and per-session disk-backed stacks. This task preserves write-through
(every change still results in a persisted stack, and eviction/hydration
ordering is maintained); it only removes the *synchronous wait* from the
action path. Flag for your review: if you interpret the contract as
requiring the write to complete before the action finishes, drop the
latest-write-wins coalescing and keep only the fire-and-forget enqueue, or
remove this task.

**Files.**
- `src/domain/core/undo-manager-v2.ts` — persist scheduling.
- `src/domain/operations/undo-operations/` — wherever the persistence
  adapter is constructed/injected.
- `src/domain/core/undo-stack.test.ts` / undo operation tests — assert
  persist still happens per change and ordering vs. eviction holds.

**Architecture compliance.** Persistence stays behind the gateway; the
`data_io` queue is the sanctioned path for disk work.

**Risk.** Medium. Tab switch hydrates stacks from disk after LRU eviction;
must guarantee a pending persist for a stack flushes before (or instead of)
a hydrating read of the same stack — easiest by routing both through the
same serial `data_io` lane keyed in FIFO order.

---

### Task A4: Don't reload the undo stack from disk on tab switch when it is in memory

**Problem.** `SetActiveTabController` awaits
`setCurrentUndoStackId.executeAndLoadForTab`, which can hit disk. With the
LRU at 5 stacks this is usually a cache hit already, but the await sits on
the action path for every tab switch.

**Change.** Keep the cache-hit path fully synchronous (no awaited disk read
when `getOrCreate` finds the stack in memory). For cache misses, hydrate via
the `data_io` queue and update `UndoStackStore` when ready, leaving the tab
switch itself instant; undo/redo menu state shows as unavailable until
hydration completes (it already rebuilds from `refreshUndoSummary`).

**Files.**
- `src/app/app/ribbon/controllers/set-active-tab-controller.ts`
- `src/domain/operations/undo-operations/set-current-undo-stack-id-operation.ts`
- `src/domain/core/undo-manager-v2.ts`

**Architecture compliance.** Same as A3.

**Risk.** Medium. An undo action dispatched in the gap before hydration must
no-op with the existing "not-available" transition result rather than
operating on an empty stack. Depends on A3's ordering guarantee.

---

## Section B — Background queue: parallelism and scheduling

### Task B1: Parallelize independent reads inside load operations

**Problem.** `LoadCatalogForDisplayOperation` loads each linked catalog
sequentially; theme selection loads theme then template snapshot serially;
preview scanning loads files one at a time in places. All are independent
reads.

**Change.** Use `Promise.all` over independent gateway reads within a single
operation (this is intra-operation concurrency, not operation-to-operation
orchestration). Audit: `LoadCatalogForDisplayOperation`,
`SelectThemeAndLoadController`'s load sequence (theme + template snapshot
can start together), `LoadPreviewsOperation` file reads.

**Files.**
- `src/domain/operations/.../load-catalog-for-display-operation.ts`
- `src/app/theme/.../select-theme-and-load-controller.ts` and its operations
- `src/domain/operations/.../load-previews-operation.ts`

**Architecture compliance.** No new cross-layer calls; gateways remain the
I/O boundary.

**Risk.** Low. Reads only; store writes still happen once results resolve,
in the owning operation.

---

### Task B2: Split `data_io` into parallel reads / serialized-per-file writes

**Problem.** The single serial `data_io` lane means a theme save blocks a
catalog load and vice versa. Reads never conflict with each other; writes
only conflict per file path.

**Change.** Replace the single `SerialQueue` for `data_io` with a keyed
scheduler: reads run concurrently (bounded pool), writes serialize **per
file key**, and a write to key K orders after pending reads/writes of K.
Callers pass an optional key (file path) with the enqueue description;
keyless work falls back to the current global-serial behavior so this is
incrementally adoptable.

**Files.**
- `src/app/core/background-queue/` — new keyed queue or extension of
  `SerialQueue`; `background-queue.ts` routing.
- `src/domain/operations/.../enqueue-background-queue-action-operation.ts` —
  optional key parameter.
- `src/app/core/queues/baseline-queues.test.ts` — ordering guarantees per
  key.

**Architecture compliance.** Queue-internal change; the queue-status
controller exception already covers its observability writes.

**Risk.** Medium. Ordering bugs here corrupt files. Mitigate with focused
tests (write-after-read same key, parallel different keys) and by defaulting
to serial when no key is provided. **This task is optional if A3/Section E
remove most redundant I/O — review whether it is still worth the
complexity after those land.**

---

### Task B3: Event-driven wakeup for `PooledQueue` (remove 100ms poll)

**Problem.** `pooled-queue.ts` polls with `setTimeout(..., 100)` while
waiting for in-flight workers, delaying completion signaling and burning
timers.

**Change.** Track in-flight completions with a promise the loop awaits
(e.g. `Promise.race` over a completion notifier) instead of polling.

**Files.**
- `src/app/core/background-queue/pooled-queue.ts`
- Existing pooled-queue tests.

**Risk.** Low. Pure scheduling refactor; observability-only impact.

---

## Section C — Offload long-running CPU work to real background threads

### Task C1: Web Worker for k-means palette clustering

**Problem.** `clusterColors` (k-means, up to 50 iterations per color group)
runs in a `useMemo` in `ThemePaletteCard` on every cluster-K change and
assignment change — synchronous main-thread CPU during slider drags.

**Change.** Introduce a `ClusteringService` in `src/gateway/services/` that
wraps a dedicated Web Worker (Vite `new Worker(new URL(...))` pattern). The
worker receives `{ hexes, maxClusters }` per group and returns cluster
results; stale requests are superseded by sequence number. Move the
clustering call out of the component: a controller/operation computes
clusters via the service and writes results to a UI store slice; the
viewmodel selects them. The card renders the last computed clusters while a
new computation is in flight (no flicker, no main-thread stall).

**Files.**
- New `src/gateway/services/clustering-service.ts` + worker entry module.
- `src/domain/utils/color-clustering.ts` — shared pure logic imported by the
  worker.
- `ThemePaletteCard.tsx` / `use-theme-palette-card-viewmodel.ts` — remove
  the in-render `useMemo` clustering; subscribe to store.
- A new operation to invoke the service and write results; wired from the
  existing cluster-K controllers.

**Architecture compliance.** Services own system integration (worker = the
system); operations own the state write; the worker module contains only
pure math, no store access. Check `test/architecture/architecture.test.ts`
renderer-import rules for the worker entry and update the test table if a
new file-category is introduced.

**Risk.** Medium. Worker bundling in Electron renderer needs a quick spike;
fall back to chunked `requestIdleCallback` computation if worker setup is
disproportionate.

---

### Task C2: Web Worker (or scoped recompute) for preview token resolution

**Problem.** `EditorPreviewsCard`'s `resolvedPreviews` re-resolves every
token of every preview — including `adjustColorToMeetContrast` and contrast
tooltip math — whenever `paneDisplayColorAssignments` changes (i.e. every
hue tick / picker preview). Virtualization limits DOM, not this compute.

**Change.** Two sub-steps, independently reviewable:

1. **Scope first (cheap):** memoize `buildScopeColorMap` keyed by the
   assignment values it actually reads, and resolve tokens lazily per
   virtual row (resolve only previews whose rows are mounted by the
   virtualizer), with per-line memo keyed on `(line, scopeColorMapVersion)`.
2. **Offload if still hot:** move `buildScopeColorMap` +
   per-preview resolution into the same worker infrastructure as C1
   (`ScopeResolutionService`), posting the assignment array and receiving
   the resolved color map; tooltips' contrast text computed on demand at
   hover time instead of eagerly for every token.

**Files.**
- `src/app/theme/editor-previews-card/EditorPreviewsCard.tsx`
- `src/app/theme/editor-previews-card/use-editor-previews-card-viewmodel.ts`
- `src/domain/utils/scope-resolver.ts` (pure; worker-importable)
- New service if sub-step 2 is taken.

**Risk.** Medium. Sub-step 1 is low-risk and may be sufficient; treat
sub-step 2 as contingent on profiling after A1 + D1 + sub-step 1.

---

## Section D — Scope state derivation and render work

### Task D1: Stop running `deriveThemePaneFields` for unrelated store writes

**Problem.** `ThemeUiStore.setThemesState` recomputes display assignments,
selected-color summary, and orphan-key sorts on **every** write — including
search text changes and selection toggles that don't affect them.

**Change.** Compute derived fields only when their inputs changed: compare
the inputs `deriveThemePaneFields` reads (`theme.colorAssignments`,
`hueAdjustment`, `checkedColorRefs`, `applyHueToDark`, `applyHueToLight`,
relevant template fields) before/after the updater and skip derivation when
all are reference-equal. Encapsulate in the store so operations don't
change.

**Files.**
- `src/domain/state/ui/theme-ui-store.ts`
- `src/domain/utils/derive-theme-pane-fields.ts` (export an input-selector
  helper so the equality check and the derivation can't drift)
- Store tests covering "search-only write does not recompute / does not
  produce new `paneDisplayColorAssignments` references".

**Architecture compliance.** Store-internal optimization; state writes still
only happen in operations.

**Risk.** Low–medium. The input list must be exhaustive; the exported
input-selector keeps it in one place. New stable references also reduce
downstream React re-renders for free.

---

### Task D2: Preview-only path for the cluster-count slider

**Problem.** Cluster-K **preview** (during drag) goes through
`SetThemeOperation`, which writes both `ThemeUiStore` and `ThemesStore` and
fans out broadly; combined with k-means recompute this makes the slider the
heaviest control in the app. Hue already has the right model: a UI-only
adjustment applied on commit.

**Change.** Mirror the hue pattern: during drag, write only a
`previewClusterCountK` field on `ThemeUiStore` (new small operation); the
palette card reads preview-K for clustering display. On commit
(pointer/mouse up — the existing commit action), run the current
`SetThemeOperation` + persist + undo-record path unchanged.

**Files.**
- `src/app/theme/theme-palette-card/controllers/set-palette-cluster-count-k-preview-controller.ts`
- New `set-cluster-count-preview-operation.ts`
- `src/domain/state/ui/theme-ui-store.ts`, palette viewmodel.

**Architecture compliance.** Same controller/operation split; undo recording
stays on commit only (matches existing hue/picker commit semantics, so no
undo-coverage classification change).

**Risk.** Low. Verify the architecture undo-coverage test classifies the
preview controller as non-state-changing-for-undo (preview-only), with
evidence, like the existing hue preview path.

---

### Task D3: Selector and memoization hygiene in hot viewmodels and rows

**Problem.** No `React.memo` or `useShallow` anywhere in `src/`. Several
viewmodels subscribe to the whole `theme` object; one selector materializes
a fresh array (`state.snapshot?.displays ?? []`); large lists
(`ThemeVariablesCard` ~100 rows, `MappingsCard` ~100 rows, `TokensCard`)
re-render entirely on any subscribed change, and `MappingsCard` re-sorts
dropdown option lists per row per render.

**Change.**
- Extract row components for `ThemeVariablesCard`, `MappingsCard`, and
  `TokensCard` and wrap in `React.memo` with primitive/stable props.
- Hoist per-row `.sort()` of shared option lists to one `useMemo` in the
  viewmodel.
- Replace whole-`theme` subscriptions with field-level selectors where the
  viewmodel only reads a few fields; add `useShallow` where a selector must
  return an array/object.
- Fix the `?? []` selector with a module-level `EMPTY_DISPLAYS` constant.

**Files.**
- `src/app/theme/theme-variables-card/ThemeVariablesCard.tsx` + viewmodel
- `src/app/template/mappings-card/MappingsCard.tsx` + viewmodel
- `src/app/catalog/tokens-card/TokensCard.tsx` + viewmodel
- `src/app/common/eyedropper-overlay/use-eyedropper-canvas-viewmodel.ts`

**Architecture compliance.** Row components are presentational; callbacks
still come from viewmodels; one component per file (new row component files
in PascalCase under the feature folder).

**Risk.** Low, but wide. Split into one PR-sized change per card if desired.

---

### Task D4: Virtualize `ThemeVariablesCard` and `MappingsCard` rows

**Problem.** ~100 complex rows each (inputs, checkboxes, contrast rows)
rendered unconditionally. `@tanstack/react-virtual` is already a dependency
(used by `EditorPreviewsCard`).

**Change.** Apply the same virtualization pattern to the variables and
mappings lists. Grouped sections can use the virtualizer's sticky/grouped
row support or virtualize within each group when groups are few.

**Files.**
- `src/app/theme/theme-variables-card/ThemeVariablesCard.tsx`
- `src/app/template/mappings-card/MappingsCard.tsx`

**Risk.** Medium (UI). Watch focus retention while typing in virtualized
inputs and keyboard navigation; keep `TokensCard` out of scope unless
profiling shows it matters. **Do D3 first; this task may become unnecessary
for `MappingsCard` if memoized rows are cheap enough.**

---

## Section E — Memory-authoritative data (persist on write, stop re-reading)

### Task E1: `RefreshCatalogRefsAndSelectOperation` accepts the in-memory catalog

**Problem.** After every catalog mutation (~20 controllers), the app saves
the catalog, then re-lists the catalogs directory **and re-loads the file it
just wrote**. The template twin already supports skipping the body reload
via an optional `template` argument.

**Change.** Mirror the template pattern: add an optional `catalog?: Catalog`
parameter; when provided, upsert it into `CatalogsStore` and skip the disk
load. Update all mutating controllers to pass their merged catalog.

**Files.**
- `src/domain/operations/.../refresh-catalog-refs-and-select-operation.ts`
- ~20 catalog controllers under `src/app/catalog/**/controllers/` (each a
  one-line call-site change)
- `ApplyCatalogUndoStateOperation` — pass the applied catalog.

**Architecture compliance.** Identical to the existing, sanctioned template
pattern.

**Risk.** Low. Disk remains the durable copy (save still happens first);
only the read-back is skipped.

---

### Task E2: Skip directory re-listing when refs are unchanged

**Problem.** `RefreshCatalogRefsAndSelectOperation` /
`RefreshTemplateRefsAndSelectOperation` always re-run `listCatalogs()` /
`listTemplates()` after a save, even for content-only edits that cannot
change the ref list (name/version unchanged).

**Change.** Add a `refsChanged: boolean` (or split into
`Refresh*RefsAndSelect` vs `Select*InMemory`) so content-only mutations skip
the directory listing. Create/delete/rename/version flows continue to
re-list.

**Files.**
- Both refresh operations + their mutating-controller call sites (same set
  as E1; do together with E1 to touch each controller once).

**Risk.** Low–medium. Requires correctly classifying each controller as
content-only vs ref-affecting; a wrong classification shows stale lists.
Reviewable as an explicit table in the PR.

---

### Task E3: Store-cache checks in entity load operations

**Problem.** `LoadThemeOperation`, `LoadTemplateOperation`,
`LoadTemplateSnapshotOperation`, and `LoadCatalogForDisplayOperation` always
hit disk even when the entity is in `ThemesStore`/`TemplatesStore`/
`CatalogsStore`. `SetSelectedCatalogOperation` already implements the
correct memory-first pattern.

**Change.** Each operation checks its store first and only falls back to the
gateway on a miss (then upserts). Because the app is the only writer and
every mutation persists through these same stores, memory is authoritative
for the session.

**Files.**
- `src/domain/operations/theme-operations/.../load-theme-operation.ts`
- `src/domain/operations/template-operations/.../load-template-operation.ts`
- `.../load-template-snapshot-operation.ts`
- `.../load-catalog-for-display-operation.ts`

**Risk.** Low–medium. External edits to data files while the app runs will
no longer be picked up on re-selection — they already weren't for catalogs.
If you want an escape hatch, keep a `forceReload` flag for the lifecycle
undo paths and delete-fallback paths; call out in review.

---

### Task E4: Remove redundant persist-on-select for themes

**Problem.** `SelectThemeAndLoadController` / `SelectThemeByNameController`
load a theme from disk, then immediately call
`applyThemeStateAndSchedulePersist` — scheduling a debounced write of
byte-identical data on every selection.

**Change.** On selection, apply theme state **without** scheduling a
persist (use the state-apply path only, or a `persist: false` variant).
Persist remains tied to actual mutations.

**Files.**
- `src/app/theme/.../select-theme-and-load-controller.ts`
- `src/app/theme/.../select-theme-by-name-controller.ts`
- Possibly a small `ApplyThemeStateOperation` (no-persist variant) to keep
  the helper-pair exception in `app-architecture.mdc` accurate — if a new
  operation pairing is added, update the architecture-test exception
  wording per the rule.

**Risk.** Low. Confirm no flow relied on select-to-repair a hand-edited
file.

---

### Task E5: Use in-memory theme/template in `GenerateThemeOperation` and version bump

**Problem.** `GenerateThemeOperation` re-reads theme and template from disk
though both live in stores; `IncrementThemeVersionController` saves the
bumped theme, then re-loads it from disk instead of updating the store.

**Change.**
- `GenerateThemeOperation`: read from `ThemeUiStore`/`TemplatesStore`,
  falling back to gateway only on miss (consistent with E3).
- `IncrementThemeVersionController`: apply the bumped theme to stores
  directly after save; drop the `loadTheme` round-trip.

**Files.**
- `src/domain/operations/.../generate-theme-operation.ts`
- `src/app/theme/.../increment-theme-version-controller.ts`

**Risk.** Low. Generation must see post-debounce state — it does, because
the store *is* the newest state (the debounce only delays the disk copy).

---

### Task E6: Flush pending debounced theme save on app unload

**Problem.** The 400ms theme-save debounce has no flush-on-unload; closing
the app within the window loses the last edit. This becomes more important
as Section E makes memory more authoritative.

**Change.** `UnloadAppController` (or its operation) calls a `flush()` on
`DebouncedThemePersistGateway` that cancels the timer and runs the pending
persist immediately, awaited during the existing unload lifecycle.

**Files.**
- `src/gateway/theme/debounced-theme-persist-gateway.ts` — add `flush()`.
- `src/app/app/app-shell/controllers/unload-app-controller.ts`
- A flush-before-quit guard in `electron/` only if the renderer unload hook
  proves unreliable (verify first).

**Risk.** Low. Correctness fix more than performance, but it is the safety
net for E1–E5.

---

### Task E7 (optional): Debounce catalog/template saves

**Problem.** Catalog/template edits (e.g. token key typing committed per
change) trigger an immediate full-file write per mutation, unlike themes
(400ms debounce).

**Change.** Reuse the debounced-persist gateway pattern for catalogs and
templates (per-entity-file debounce, flushed on unload via E6's mechanism
and before any operation that reads the file back — moot after E1/E3).

**Files.**
- New `src/gateway/catalog/debounced-catalog-persist-gateway.ts`,
  `src/gateway/template/debounced-template-persist-gateway.ts` (mirror the
  theme gateway)
- `SaveCatalogOperation` / `SaveTemplateOperation`.

**Risk.** Medium. Widens the unsaved-window for catalogs/templates;
**review whether you want this at all** — E1/E2 already remove the
read-back cost, so this only reduces write amplification.

---

## Section F — Verification and guardrails

### Task F1: Performance regression smoke tests + architecture-test sync

**Change.**
- Add unit tests asserting the new queue behaviors (A1 coalescing, A3
  persist scheduling, B2 keyed ordering if kept).
- Add a store test asserting D1's "no derivation on unrelated writes".
- Update `test/architecture/architecture.test.ts` and
  `.cursor/rules/app-architecture.mdc` **together** wherever a task adds or
  reclassifies an exception (A2's background enqueue is already covered; E4
  may reword the theme helper-pair exception; C1/C2 add a worker service
  category).
- Run the full suite (`vitest`) plus the undo-coverage architecture test
  after each section lands.

**Manual verification checklist** (per section): hue-slider drag with
previews open stays smooth; color-picker live preview tracks the cursor;
cluster slider drags without stutter; tab switching is instant; eyedropper
opens without freezing other controls; undo/redo/history still replay all
representative workflows from the 004 spec; catalog/template edits survive
app restart.

---

## Suggested execution order

1. **A1, D1, D2** — biggest interactivity wins, smallest blast radius.
2. **E1, E2, E4, E5, E6** — memory-authoritative pass (one controller sweep).
3. **A2, A3, A4** — unblock the action queue from async work.
4. **D3** (then re-profile) → **C1, C2, D4** only where profiling still
   shows main-thread stalls.
5. **B1, B3** cheap wins anytime; **B2, E7** only if still justified after
   the above.
6. **F1** continuously, with each section.

## Explicitly out of scope

- Electron `utilityProcess` migration (Web Workers suffice for the CPU work
  identified).
- Changing undo diff granularity (whole-`Theme`/`Catalog` before/after
  payloads). The 004 contract prefers focused diffs and this would cut undo
  persist cost substantially, but it is a behavior-adjacent undo redesign,
  not a pure optimization — raise separately if wanted.
- Incremental/append-only undo file format.
- Any change to action semantics, payload shapes, or the mutation-flow
  layering.
