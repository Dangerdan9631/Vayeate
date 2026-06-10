# Plan 2: Baseline "Opened" History Entry Per Undo Context

## Goal

Every undo context's history list must start with an initial entry such as
`Opened dark-theme@3.0.0` representing the state when the template, catalog,
or theme was opened. Selecting it reverts every recorded action in that
context, returning to the state immediately before the first user action.

This plan assumes Plan 1 (`plan-1-history-selection-after-semantics.md`) is
applied: clicking an entry lands on the state immediately **after** that
entry, so clicking the baseline lands on the state "after opening" = before
any user action, which corresponds to `currentIndex === -1`.

## Design decision: synthetic summary item, not a persisted frame

The baseline is **not** stored as a frame in the stack:

- `undoEntrySchema` (`src/model/undo-history.ts`) requires
  `diffs: z.array(undoDiffSchema).min(1)`; a baseline has no diffs.
- `push()` prunes `frames.slice(0, currentIndex + 1)`; a real frame at index 0
  would need special-casing in push, undo, persistence cap
  (`getPersistedState` slices to `diskMaxFrames`), and hydration.
- The stack already has a natural baseline: `currentIndex === -1`,
  `currentId === null`.

Instead, the baseline is a **synthetic item** with a reserved id, prepended to
the renderer summary and special-cased in `goto()`. Nothing about frames,
push/undo/redo index arithmetic, persistence, hydration, or pruning changes.

Reserved id constant (exported, single source of truth):

```ts
export const UNDO_BASELINE_FRAME_ID = '__undo-baseline__';
```

Place it in `src/model/undo-history.ts` alongside the other undo model types,
since both domain (`undo-stack.ts`) and app/summary layers need it. The id
uses characters that cannot collide with `createFrameId()` output.

## Changes

### 1. `src/model/undo-history.ts`

- Add `export const UNDO_BASELINE_FRAME_ID = '__undo-baseline__';`
- Add a label helper used when switching contexts:

```ts
export function deriveUndoBaselineLabel(context: UndoContext): string {
  const ref =
    context.tabId === 'catalogs' ? context.catalogRef :
    context.tabId === 'templates' ? context.templateRef :
    context.themeRef;
  if (!ref) return 'Opened';
  return `Opened ${ref.name}@${ref.version}`;
}
```

  The active tab determines which ref names the context: the catalogs tab
  shows `Opened <catalog>`, templates tab `Opened <template>`, themes tab
  `Opened <theme>`. All four call sites of `executeAndLoadForContext` pass a
  full `UndoContext` containing structured refs, so the label is derivable
  with no new parameters (verified in `SetSelectedCatalogController`,
  `SelectTemplateAndLoadController`, `SelectThemeAndLoadController`,
  `SetActiveTabController`).

### 2. `src/domain/state/undo-stack/undo-stack-state.ts`

- Add `baselineLabel: string` to `UndoMenuSnapshot` (or extend the snapshot
  with a dedicated baseline list entry — see step 4; the label field is the
  minimal change).
- Update `emptyUndoMenuSnapshot` with `baselineLabel: 'Opened'`.
- Add `currentBaselineLabel: string` to `UndoStackState` +
  `initialUndoStackState` so the label survives summary refreshes that do not
  re-derive context (see step 5).

### 3. `src/domain/state/undo-stack/undo-stack-store.ts`

- Add setter `setCurrentBaselineLabel(label: string)` following the existing
  immer setter pattern.

### 4. `src/domain/operations/undo-operations/undo-operation-helpers.ts`

`refreshUndoSummary(undoStackStore, stack)` builds the `UndoMenuSnapshot`.
Changes:

- Read `baselineLabel` from `undoStackStore.getStore().state.currentBaselineLabel`.
- Prepend the synthetic baseline to the frames list:

```ts
const baselineEntry = { id: UNDO_BASELINE_FRAME_ID, description: baselineLabel };
const snapshot: UndoMenuSnapshot = {
  ...availability,
  frames: [baselineEntry, ...availability.recentActions],
  currentId: list.currentId ?? UNDO_BASELINE_FRAME_ID,
  baselineLabel,
};
```

- `currentId: list.currentId ?? UNDO_BASELINE_FRAME_ID` is the key line: when
  `currentIndex === -1` (fresh context, or everything undone), the baseline
  item is the checkmarked "current" entry in the menu.
- For the `!stack` branch (no active context), keep
  `{ ...emptyUndoMenuSnapshot, historyVersion: nextVersion }` — no baseline
  row when there is no context; `MenuBar.tsx` will show "No history".

### 5. `src/domain/operations/undo-operations/set-current-undo-stack-id-operation.ts`

`executeAndLoadForContext(context)` is the single place every context switch
funnels through. Changes:

- When `context` is non-null, compute
  `deriveUndoBaselineLabel(context)` and call
  `store.setCurrentBaselineLabel(label)` before `refreshUndoSummary`.
- When `context` is null, reset the label to `'Opened'`.
- `executeForContext` (sync variant without load) should also set the label
  so `RecordUndoEntryOperation` callers that re-derive context (the existing
  theme controllers call `executeForContext` before recording) keep the label
  in sync.

No changes needed in the four calling controllers
(`SetSelectedCatalogController`, `SelectTemplateAndLoadController`,
`SelectThemeAndLoadController`, `SetActiveTabController`) — they already pass
full `UndoContext` values. Note `SelectThemeAndLoadController` calls
`executeAndLoadForContext` twice (before and after async theme load); both
calls produce the same `themeRef`-based label, so this is benign.

### 6. `src/domain/core/undo-stack.ts` — goto baseline support

In `goto(id)`, before the `findIndex` lookup, special-case the baseline:

```ts
async goto(id: string): Promise<HistoryTransitionResult> {
  const targetIndex = id === UNDO_BASELINE_FRAME_ID
    ? -1
    : frames.findIndex((frame) => frame.id === id);
  if (targetIndex < 0 && id !== UNDO_BASELINE_FRAME_ID) {
    return transitionResult('not-available', 'go-to', stackId, id, 'The selected history entry is unavailable.');
  }
  const targetCurrentIndex = targetIndex; // -1 for baseline (Plan 1 semantics)
  ...
}
```

The existing revert-walk loop (`while (currentIndex > targetCurrentIndex)`)
already handles walking down to `-1`; `undo()` proves index `-1` is a valid
resting position. The early-exit equality check makes clicking the baseline a
no-op when already fully undone. Failure rollback and `notifyChange()` are
unchanged.

The baseline is inherently:

- never pruned (it is not a frame, so `push()` pruning cannot remove it),
- never persisted (`getPersistedState()` reads only `frames`),
- always present per context (synthesized at summary time),
- not undoable "past" (at `currentIndex === -1`, `canUndo` is already false).

### 7. `src/app/app/menu-bar/MenuBar.tsx` — rendering

No structural change required: the baseline arrives as the first element of
`frames` and the existing map/checkmark/click code handles it (click sends its
id through `HistoryMenuGoToButtonOnClick` like any other frame, and
`HistoryGoToOperation` passes it to `stack.goto`).

Optional polish (recommended): give the baseline row a distinct class so it
can be styled (e.g. separator below it):

```tsx
className={`menu-edit-history-item ${frame.id === currentId ? 'menu-edit-history-current' : ''} ${frame.id === UNDO_BASELINE_FRAME_ID ? 'menu-edit-history-baseline' : ''}`}
```

The "No history" empty branch now only renders when no context is active
(empty snapshot has `frames: []`); with an active context there is always at
least the baseline row.

### 8. Importing the constant across layers

`UNDO_BASELINE_FRAME_ID` lives in `src/model/undo-history.ts`, which is
already imported by `undo-stack.ts` (via types), the undo operations, and the
menu-bar action payloads — no layering violations (model is the innermost
layer; app and domain may both import it).

## Test updates and additions

### `src/domain/core/undo-stack.test.ts`

Add tests:

1. `goes to the baseline state when the baseline id is selected`:
   push f1 (a->b), f2 (b->c); `state.value === 'c'`;
   `await stack.goto(UNDO_BASELINE_FRAME_ID)` resolves
   `{ status: 'transitioned' }`; `state.value === 'a'`;
   `stack.list().currentId === null`; `stack.canRedo === true`.
2. `redoes forward from the baseline`: after the goto above,
   `goto('f2')` (or two redos) returns `state.value` to `'c'`.
3. `baseline goto is a no-op on a fresh stack`: empty stack,
   `goto(UNDO_BASELINE_FRAME_ID)` returns `transitioned` without invoking the
   processor.

### `src/domain/operations/undo-operations` summary tests

Wherever `refreshUndoSummary` snapshot shape is asserted
(`session-and-preview-baseline.test.ts` and
`record-undo-entry-operation.test.ts` if they assert `frames`):

- Update expectations: `frames[0]` is
  `{ id: UNDO_BASELINE_FRAME_ID, description: <label> }` and recorded entries
  shift to `frames[1..]`.
- Fresh context: `frames` has exactly the baseline row and
  `currentId === UNDO_BASELINE_FRAME_ID`.

### `src/app/theme/theme-renderer-workflows.test.tsx`

- Existing history tests index into `undoMenu.frames[0]` / `frames[1]` for
  recorded entries; shift indices by one (baseline occupies `frames[0]`).
- Add workflow test: select theme, make two color edits, `goTo.execute(
  UNDO_BASELINE_FRAME_ID)`, assert the color assignment equals the originally
  loaded value, `undoMenu.currentId === UNDO_BASELINE_FRAME_ID`,
  `canUndo === false`, `canRedo === true`.
- Assert baseline label: after `SelectThemeAndLoadController` runs for
  `theme-a@3.0.0` (use the names in the existing fixtures),
  `undoMenu.frames[0].description === 'Opened theme-a@3.0.0'`.

### `src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx`

- Tests mock `undoMenu` snapshots directly; update mocked snapshots to include
  a baseline first row and add an assertion that clicking it dispatches
  `handleHistoryItemClick(UNDO_BASELINE_FRAME_ID)`.
- Update the `currentId: 'first'` checkmark test if its mocked frames are
  repositioned.

### Catalog/template renderer workflow tests

`catalog-renderer-workflows.test.tsx` and
`template-renderer-workflows.test.tsx` assert `undoMenu.frames` contents after
recording; shift indices and/or filter out the baseline row where they count
entries.

## Documentation and directive synchronization

1. `specs/004-add-undo-functionality/spec.md` — add/extend the history-list
   requirement: every context's ordered history list begins with a baseline
   "opened" item; selecting it reverts all recorded actions in the context.
2. `specs/004-add-undo-functionality/data-model.md` — document the synthetic
   baseline list entry (reserved id, label source, not persisted, not a
   frame).
3. `specs/004-add-undo-functionality/contracts/undo-history-contract.md` —
   baseline rules: always first, never pruned, never persisted, goto target
   `currentIndex === -1`.
4. `specs/004-add-undo-functionality/tasks.md` — add implementation +
   validation tasks for the baseline entry.
5. `AGENTS.md` SPECKIT directive — extend the history-selection sentence to
   mention the baseline opened item if regenerated.

## Validation

1. `npx vitest run src/domain/core/undo-stack.test.ts`
2. `npx vitest run src/domain/operations/undo-operations`
3. `npx vitest run src/app/theme/theme-renderer-workflows.test.tsx src/app/catalog/catalog-renderer-workflows.test.tsx src/app/template/template-renderer-workflows.test.tsx`
4. `npx vitest run src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx`
5. `npm run lint` and full `npx vitest run`
6. Manual smoke: open a theme, verify History shows `Opened <name>@<version>`
   checkmarked; make edits; click the baseline; verify the theme returns to
   its just-opened state and all edits remain redoable; make a new edit and
   verify redo branch pruning still works (baseline still present).

## Acceptance criteria

- Every active context's history list starts with `Opened <name>@<version>`
  (tab-appropriate ref).
- Clicking the baseline reverts every recorded action (state immediately
  before the first user action) and checkmarks the baseline.
- Baseline is checkmarked on a freshly opened context and after full undo.
- Baseline never appears in persisted stack files and is never pruned.
- Context switching shows the correct per-context baseline label.
