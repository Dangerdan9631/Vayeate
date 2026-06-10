# Plan 1: History Selection Lands on the State After the Clicked Entry

## Goal

Clicking an entry in the History menu must move the application to the state
immediately **after** that entry's action was applied. Today it moves to the
state immediately **before** the clicked entry. After this change, the clicked
entry becomes the "current" entry (checkmarked), which matches user
expectations: "click the action you want to be at."

## Current behavior

The full goto pipeline:

```text
MenuBar.tsx (history item click, data-frame-id)
  -> use-menubar-viewmodel.ts handleHistoryItemClick
  -> AppMenuActionType.HistoryMenuGoToButtonOnClick { frameId }
  -> AppMenuHandler -> HistoryGoToController.run(frameId)
  -> HistoryGoToOperation.execute(frameId)
  -> stack.goto(frameId)            // src/domain/core/undo-stack.ts
  -> refreshUndoSummary(...)        // rebuilds UndoMenuSnapshot
```

The defect-by-design is in `src/domain/core/undo-stack.ts`, `goto()` (lines
138-172):

```ts
async goto(id: string): Promise<HistoryTransitionResult> {
  const targetIndex = frames.findIndex((frame) => frame.id === id);
  if (targetIndex < 0) {
    return transitionResult('not-available', 'go-to', stackId, id, 'The selected history entry is unavailable.');
  }

  const targetCurrentIndex = targetIndex - 1;   // <-- lands BEFORE the entry
  ...
  while (currentIndex > targetCurrentIndex) {
    await runRevert(processor, frames[currentIndex].diffs);
    currentIndex -= 1;
  }
  while (currentIndex < targetCurrentIndex) {
    const next = frames[currentIndex + 1];
    await runApply(processor, next.diffs);
    currentIndex += 1;
  }
  ...
}
```

Semantic model of the stack (unchanged by this plan):

- `currentIndex` points at the last **applied** frame; `-1` means nothing
  applied (the opened/baseline state).
- `list().currentId` / `availability()` / `getPersistedState()` all derive
  `currentId` from `frames[currentIndex]`.
- `MenuBar.tsx` checkmarks the frame whose `id === currentId`.

## Change

### 1. `src/domain/core/undo-stack.ts`

In `goto()`, change one line:

```ts
const targetCurrentIndex = targetIndex - 1;
```

to:

```ts
const targetCurrentIndex = targetIndex;
```

Everything else in `goto()` (the revert/apply walk loops, failure rollback of
`currentIndex`, `notifyChange()`, transition results) is index-based and
already correct for the new target. No changes are needed in `undo()`,
`redo()`, `push()`, `list()`, `availability()`, or `getPersistedState()`.

Note the early-exit `if (currentIndex === targetCurrentIndex)` now means
"clicking the already-current (checkmarked) entry is a no-op", which is the
desired UX.

### 2. No UI changes required

`MenuBar.tsx` checkmark logic (`frame.id === currentId`) is already correct
under the new semantics: after `goto(f2)`, `currentIndex` points at `f2`, so
`currentId === 'f2'` and the clicked entry is checkmarked.

`HistoryGoToController` and `HistoryGoToOperation` are pass-throughs and need
no change.

### 3. Reachability note (dependency on Plan 2)

With before-semantics, clicking the first entry was the only way to return to
the fully-undone (opened) state via the history list. With after-semantics
that capability moves to the baseline "opened" entry introduced by **Plan 2**
(`plan-2-baseline-open-history-entry.md`). If Plan 1 ships alone, the
fully-undone state remains reachable only via repeated Undo (Ctrl+Z), which is
acceptable as an intermediate state but the two plans should land together or
Plan 2 immediately after.

## Test updates

### `src/domain/core/undo-stack.test.ts`

Rewrite the test currently named
`goes to the state immediately before the selected entry` (lines ~78-92):

- New name: `goes to the state immediately after the selected entry`.
- Setup unchanged: push `f1` (a->b), `f2` (b->c), `f3` (c->d) with the shared
  `processor(state)` helper, ending at `state.value === 'd'`.
- New assertions:
  - `await stack.goto('f2')` resolves `{ status: 'transitioned', entryId: 'f2' }`
  - `state.value` is `'c'` (after f2, not `'b'`)
  - `stack.list().currentId` is `'f2'` (not `'f1'`)
- Add a second case in the same test (or a sibling test) covering goto
  **forward**: after `goto('f2')`, `goto('f3')` re-applies f3 and lands at
  `state.value === 'd'`, `currentId === 'f3'`.
- Add a no-op case: `goto('f2')` twice in a row leaves state and `currentId`
  unchanged and still returns `transitioned`.

### `src/app/theme/theme-renderer-workflows.test.tsx`

Rewrite the test `navigates theme edit history to the state immediately before
a selected item` (lines ~581-626). Setup: two recorded color changes
`#111111 -> #222222 -> #333333` producing entries `frames[0]` and `frames[1]`;
the test calls `goTo.execute(secondEntryId)` where
`secondEntryId = undoMenu.frames[1].id`.

- New name: `navigates theme edit history to the state immediately after a
  selected item`.
- To keep the test meaningful (actually moving backward), navigate to the
  **first** entry instead: `goTo.execute(firstEntryId)` with
  `firstEntryId = undoMenu.frames[0].id`, then assert:
  - `themeUiStore...colorAssignments[0].dark?.value` is `'#222222'`
    (state after the first change)
  - `undoMenu.currentId === firstEntryId`
  - `undoMenu.canRedo === true` (frames[1] is redoable)
- Optionally keep a second assertion block navigating back to
  `secondEntryId` and asserting `'#333333'`, `currentId === secondEntryId`,
  `canRedo === false`.

### Tests that do NOT need changes

- `menu-bar-renderer-workflows.test.tsx` — mocks the snapshot and only routes
  frame ids; no goto semantics encoded.
- `undo-manager-v2.test.ts`, `session-and-preview-baseline.test.ts`,
  `record-undo-entry-operation.test.ts` — no goto coverage.
- `undo-stack.test.ts` tests 1, 2, 3, 5 (undo/redo order, 20-action depth,
  branch pruning, push rollback) — index semantics of push/undo/redo are
  untouched.

## Documentation and directive synchronization

The "state immediately before the selected item" rule is encoded in several
artifacts and must be flipped to "state immediately after the selected item"
in all of them:

1. `specs/004-add-undo-functionality/spec.md` — FR-011 (history-list
   selection requirement).
2. `specs/004-add-undo-functionality/plan.md` — Phase 0 Research Summary
   bullet ("moves the active context to the state immediately before the
   selected item") and Final Validation Notes ("History-list validation must
   prove selecting an entry moves to the state immediately before that
   entry").
3. `specs/004-add-undo-functionality/research.md` — history-list navigation
   decision.
4. `specs/004-add-undo-functionality/data-model.md` — history position /
   transition wording if present.
5. `specs/004-add-undo-functionality/quickstart.md` — validation scenario
   wording.
6. `specs/004-add-undo-functionality/contracts/undo-history-contract.md` —
   list-navigation rule.
7. `specs/004-add-undo-functionality/tasks.md` — T052 ("history go-to targets
   the state immediately before the selected item") and any other tasks
   repeating the rule.
8. `AGENTS.md` (SPECKIT-managed section) — the directive sentence "ordered
   history-list selection returns to the state immediately before the
   selected item" becomes "...immediately after the selected item". Use the
   `speckit-agent-context-update` skill if regenerating the managed block.

## Validation

1. `npx vitest run src/domain/core/undo-stack.test.ts`
2. `npx vitest run src/app/theme/theme-renderer-workflows.test.tsx`
3. `npx vitest run src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx`
   (regression; should pass unmodified)
4. `npm run lint`
5. Full suite: `npx vitest run`
6. Manual smoke: open a theme, make 3 color edits, open History, click the
   first entry — app shows the state after edit 1, checkmark sits on the
   clicked entry, Redo is enabled; click the last entry — state after edit 3,
   Redo disabled.

## Acceptance criteria

- `goto(id)` results in `currentIndex === indexOf(id)`; the clicked entry is
  checkmarked.
- Clicking the checkmarked entry is a visible no-op.
- Forward and backward navigation both work and update `canUndo`/`canRedo`
  correctly.
- All artifacts listed above no longer say "before the selected item".
