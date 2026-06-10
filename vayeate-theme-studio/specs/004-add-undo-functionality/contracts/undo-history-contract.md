# Contract: Undo History

## Stack Identity

Undo history is scoped by the active undo context:

1. Active tab.
2. Active `templateRef`, when applicable.
3. Active `catalogRef`, when applicable.
4. Active `themeRef`, when applicable.

Each `*Ref` uses the existing typed reference shape with `name` and `version`.
The context identity must be stable for the same visible working context during
one app session. Switching to a different tab, template reference, catalog
reference, or theme reference activates the stack for that context. Returning to
a previously used context restores that context's stack for the same app
session.

## Retention And Disk Backing

Undo history is per-session state backed by disk during the active app session.

- History remains available while the app stays open.
- Stack information is written to disk as it changes.
- Persisted stack information may be used to release in-memory undo data during
  the same app session.
- Startup clears persisted undo state from prior sessions before users can
  interact with undo history.
- Startup must not hydrate undo history from prior-session files.
- Shutdown does not need to preserve undo stacks for a future session.

## Recording

An undo entry may be recorded only when all of the following are true:

- The initiating action was user-originated.
- The action completed successfully.
- The action changed application-visible state.
- The action generated focused before/after diffs that can undo and redo the
  change from plain policy-owned data.
- The active undo context is known.
- The stack change can be written to disk or otherwise retained with equivalent
  active-session guarantees.

Validation failures, canceled actions, interrupted actions, repeated pending
work, and failed external details do not create undo entries unless a confirmed
visible state change exists and can be reversed safely.

## Diff Contract

Undo entries store action-generated diffs, not whole application state
snapshots. Each diff records:

- the action type that generated it
- the stable target mutated by the action
- before state used for undo
- after state used for redo

Diffs must be generated where the action has mutation context. They must avoid
capturing unrelated derived state, component state, framework objects, transport
payloads, filesystem handles, or whole application snapshots.

## Ordering

Undo entries are reversed in last-in, first-out order within the active stack.
Redo reapplies previously undone entries in order. Undo, redo, or history
navigation in one context must not reverse, reapply, or reorder entries in any
inactive stack. At least 20 consecutive completed actions in one context must
remain undoable in reverse order for acceptance validation.

When a new entry is recorded after one or more entries were undone, entries
after the current stack position are removed and can no longer be redone.
Entries before the current stack position remain available as undo history.

## History List Navigation

The active stack can be displayed as an ordered list of recent actions. Selecting
an item from the list moves the application to the state immediately before that
item by undoing or redoing each intervening item in order. History-list
navigation must use the same policy-owned transition rules as stepwise undo and
redo.

## Availability

The app exposes a read-only availability summary for the active context.

- `canUndo` is true only when the active context has an entry available to
  reverse.
- `canRedo` is true only when the active context has an entry available to
  reapply.
- The next undo and redo descriptions belong to the active context only.
- The ordered recent-action list belongs to the active context only.
- Context changes update availability to match the newly active stack.
- Passive renderer summaries do not own or mutate undo state.

## Failure Behavior

When undo, redo, or history navigation is unavailable, invoking it leaves
visible state unchanged. When a transition fails, the application preserves a
consistent current state, reports the failure through normal workflow feedback,
and keeps the targeted entry unless the transition is confirmed.

If writing stack information to disk fails, the app must not present the action
as safely undoable unless it can retain enough active-session history to provide
the same undo, redo, and history-list guarantees.

## Out of Scope

Crash recovery and cross-session restoration are outside the initial feature
unless later specifications expand the scope.
