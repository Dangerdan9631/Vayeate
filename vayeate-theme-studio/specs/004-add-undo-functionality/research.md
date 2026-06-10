# Research: Add Undo Functionality

## Decision: Persist undo history to disk during the session and clear it on startup

**Rationale**: The feature requires undo history to remain per-session while
also allowing very large histories to be written to disk so in-memory data can
be released without hurting application performance. Current source includes an
`UndoGateway` that writes stack files under `data/.undo` and an undo manager that
can hydrate persisted frames. The aligned behavior is write-through
active-session persistence plus startup clearing, not cross-session restoration.

**Alternatives considered**:

- Keep history only in memory. Rejected because large undo histories may degrade
  application performance when data needs to be released.
- Restore persisted undo after restart. Rejected because undo state remains
  per-session and must be cleared on startup.
- Persist undo only for crash recovery. Rejected because crash recovery is not
  in scope and would materially change retention expectations.

## Decision: Key undo stacks by active tab and existing content reference types

**Rationale**: The user clarified that template, catalog, and theme identity
should use existing `*Ref` types rather than separate ID/version fields. The app
already models these as `TemplateReference`, `CatalogReference`, and
`ThemeReference` values with `name` and `version`. A stable context key derived
from active tab plus those refs prevents undo from crossing tabs, content types,
or versions while preserving the app's current typed boundary language.

**Alternatives considered**:

- Use one global undo stack. Rejected because it would reverse work from the
  wrong tab or content context.
- Use one stack per content entity only. Rejected because the tab dimension is
  part of the requirement and app workflows may expose the same content through
  different editing surfaces.
- Store separate `templateId`, `catalogId`, `themeId`, and `versionId` fields.
  Rejected because it duplicates existing `*Ref` model types and weakens typed
  boundary consistency.
- Create a new empty stack on every selection change. Rejected because returning
  to a previous theme/version must restore its old stack.

## Decision: Record entries only after completed reversible changes

**Rationale**: Undo history must represent real user-visible state changes.
Validation failures, cancellations, interrupted work, and external-detail
failures should not appear as undoable unless the application has a confirmed
state change that can be reversed consistently.

**Alternatives considered**:

- Record speculative entries before validation or queue completion. Rejected
  because failed work would pollute history.
- Record every UI event, including navigation, hover, and read-only inspection.
  Rejected because the spec bounds "every user action" to completed
  state-changing actions.
- Record entries at component level. Rejected because components do not own
  policy state or mutation ordering.

## Decision: Store action-generated before/after diffs, not whole-state snapshots

**Rationale**: The action has the correct context for what was or was not
mutated, so it is the right boundary for generating a focused diff. Storing
before and after state in that diff supports both undo and redo without writing
entire application state snapshots to the undo stack.

**Alternatives considered**:

- Store whole application snapshots. Rejected because large histories would
  grow quickly and obscure which action-owned mutation is being reversed.
- Generate diffs later by comparing stores globally. Rejected because it loses
  action context and risks capturing unrelated derived or concurrent state.
- Store only before state. Rejected because redo requires the after state to
  reapply the change without recomputing policy context from stale inputs.

## Decision: Put undo participation behind policy-owned operations

**Rationale**: The constitution requires mutation and invariants to live in
domain/application policy units. Undo must restore prior or after state through
the same ownership boundaries as the original action instead of allowing
components, handlers, or gateways to write state directly.

**Alternatives considered**:

- Let handlers push undo frames around controller calls. Rejected because
  handlers would own completion and mutation policy.
- Let components snapshot input state before dispatching. Rejected because
  components lack complete policy context and may include derived state.
- Centralize all state mutation in one generic undo service. Rejected because it
  risks a dumping ground and hides feature-specific invariants.

## Decision: Support redo and ordered history-list navigation

**Rationale**: The user clarified that undone actions can be redone and that the
stack can be displayed as an ordered recent-action list. Selecting an item
returns to the state immediately before that item by applying undo or redo for
each intervening item in order. This aligns with existing redo and
history-go-to affordance names in the codebase while making their semantics
explicit in the spec.

**Alternatives considered**:

- Limit the initial feature to single-step undo. Rejected because the clarified
  scope explicitly includes redo and history-list selection.
- Let history-list selection jump directly by replacing state snapshots.
  Rejected because the clarified behavior requires undoing or redoing each item
  in order, preserving operation-owned state transitions.

## Decision: Prune redoable branch entries when a new action is recorded

**Rationale**: The user clarified standard branching behavior: once a new item
is added after undo, previously undone actions are removed and can no longer be
redone, while earlier undo history remains. This keeps the ordered list linear
and prevents redo from applying actions that no longer follow the current state.

**Alternatives considered**:

- Keep alternate redo branches. Rejected because it contradicts the clarified
  linear stack behavior.
- Clear all history after a new branch action. Rejected because the user
  clarified existing undo history before that point remains.

## Decision: Treat renderer undo summaries as read-only views

**Rationale**: Menu and status surfaces need to show whether undo or redo is
available and display the ordered recent-action list, but summaries must not own
history or mutate stacks. They should render explicitly owned state derived from
the active context.

**Alternatives considered**:

- Let menu state manage its own undo history. Rejected because it duplicates
  policy state and creates drift across surfaces.
- Recompute history by scanning all app stores from the renderer. Rejected
  because it leaks policy details and would be brittle.

## Decision: Validate by representative workflow categories plus enforcement

**Rationale**: "Every user action" is broad and cross-cutting. The feature needs
policy tests for stack behavior and focused renderer/app workflow tests for
representative app shell, catalog, template, and theme actions, backed by
architecture enforcement that prevents future workflows from bypassing undo
participation rules.

**Alternatives considered**:

- Add one end-to-end test for undo. Rejected because it cannot prove context
  separation, failure handling, or ownership boundaries.
- Require exhaustive tests for every individual action before planning.
  Rejected because task generation should classify and slice specific workflow
  coverage proportionate to risk.
