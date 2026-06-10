# Feature Specification: Add Undo Functionality

**Feature Branch**: `[004-add-undo-functionality]`

**Created**: 2026-06-07

**Status**: Draft

**Input**: User description: "Add undo functionality to the application. Every user action should be undoable. Undo stacks should be maintained per tab and per template/catalog/theme and version (e.x. if the user changes a theme, it should create a new stack. going back to the previous theme should restore the old undo stack) Undo history should be maintained for the duration the app is opened."

## Clarifications

### Session 2026-06-08

- Q: How should template, catalog, and theme identity be represented in undo contexts? -> A: Use existing `*Ref` types such as `templateRef`, `catalogRef`, and `themeRef`, each carrying `name` and `version`, instead of separate ID and version fields.
- Q: What history navigation is in scope beyond undo? -> A: Undone actions can be redone, the undo stack can be displayed as an ordered recent-action list, and selecting an item returns to the state immediately after that item by undoing or redoing intervening items in order.
- Q: What happens to redo history when a new action is recorded after undo? -> A: Previously undone actions are removed and can no longer be redone, while existing undo history before that point remains.
- Q: How should large undo history be stored while remaining per-session? -> A: Undo stack information must be written to disk as it changes, may release in-memory data for performance, remains per-session, and persisted undo state is cleared on app startup.
- Q: What should undo entries store? -> A: Undo entries store action-generated diffs rather than whole application snapshots, and each diff records before and after state needed for undo and redo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Undo Recent Work in the Active Context (Priority: P1)

As a user editing theme studio content, I need to undo my most recent action in
the current tab and active template, catalog, and theme reference context so I
can recover from mistakes without manually reconstructing prior values.

**Why this priority**: Undo is only useful if the most common editing mistakes
can be reversed immediately in the same working context.

**Independent Test**: Start with a known template, catalog, theme, version, and
tab; perform several visible edits; invoke undo repeatedly; verify each undo
restores the previous user-visible state in reverse order without changing
other tabs or inactive content contexts.

**Acceptance Scenarios**:

1. **Given** a user has made three successful state-changing actions in the
   active tab and content context, **When** the user invokes undo once, **Then**
   only the third action is reversed and the first two actions remain applied.
2. **Given** a user has undone the latest action in the active context, **When**
   the user invokes undo again, **Then** the next most recent action in that same
   context is reversed.
3. **Given** no undoable action exists for the active context, **When** the user
   invokes undo, **Then** the visible state remains unchanged and the user is not
   led to believe a change was reversed.

---

### User Story 2 - Preserve Separate Undo History Per Tab and Content Version (Priority: P1)

As a user moving between tabs, templates, catalogs, themes, and versions, I need
each working context to keep its own undo history so undo never reverses work
from the wrong place.

**Why this priority**: The application contains multiple editable contexts, and
cross-context undo would make users lose trust in the feature.

**Independent Test**: Perform different edits in two tabs and across two
template, catalog, or theme reference contexts; switch between them; verify the
available undo state and reversed actions always match the active context only.

**Acceptance Scenarios**:

1. **Given** a user edits `themeRef` A, then switches to `themeRef` B,
   **When** the user invokes undo in `themeRef` B, **Then** only actions
   performed in `themeRef` B are eligible for reversal.
2. **Given** a user edits a template in one tab and a catalog in another tab,
   **When** the user switches tabs, **Then** each tab exposes the undo history
   that belongs to that tab and active content context.
3. **Given** a user leaves `themeRef` A after building an undo history, **When**
   the user later returns to `themeRef` A during the same app session, **Then**
   the prior undo history for `themeRef` A is restored.

---

### User Story 3 - Keep Session History With Disk-Backed Runtime Storage (Priority: P2)

As a user, I need undo history to remain available while the application stays
open, even when history grows large, and to reset cleanly when the application
is reopened so stale history does not affect a later work session.

**Why this priority**: Session-long retention supports normal editing flow, and
disk-backed runtime storage prevents large histories from degrading application
performance while still avoiding stale cross-session undo entries.

**Independent Test**: Build undo history, navigate among contexts during the
same application session, verify the histories remain available after stack data
has been written to disk, then close and reopen the application and verify prior
persisted undo state is cleared before use.

**Acceptance Scenarios**:

1. **Given** a user has undo history in several tabs and content contexts,
   **When** the user navigates among those contexts without closing the
   application, **Then** each context retains its undo history.
2. **Given** the application is closed after undo history exists, **When** the
   application is opened again, **Then** no undo entries from the prior session
   are available.
3. **Given** undo history grows large during an app session, **When** the app
   writes undo stack information to disk and releases in-memory data, **Then**
   undo, redo, and history-list navigation still work for the active session.

---

### User Story 4 - Redo and Navigate Recent Action History (Priority: P2)

As a user reviewing recent changes, I need to redo undone actions and choose an
item from the ordered recent-action list so I can move to the state immediately
after that item without repeatedly invoking undo or redo manually.

**Why this priority**: Undo history is more usable when users can inspect recent
actions and intentionally move through the history instead of stepping blindly.

**Independent Test**: Perform several completed actions, undo one or more,
verify redo restores the undone changes in order, then select an older and newer
history item and verify the application reaches the state immediately after the
selected action by undoing or redoing intervening actions in order.

**Acceptance Scenarios**:

1. **Given** a user has undone two completed actions in the active context,
   **When** the user invokes redo once, **Then** the oldest undone action in the
   redo path is reapplied and the remaining undone action stays redoable.
2. **Given** a user views the ordered recent-action list for the active context,
   **When** the user selects a history item, **Then** the application returns to
   the state immediately after that item by undoing or redoing each intervening
   item in order.
3. **Given** an active undo context, **When** the user views the ordered
   recent-action list, **Then** the list begins with a baseline "opened" item
   naming the active tab-appropriate `*Ref` (for example
   `Opened dark-theme@3.0.0`).
4. **Given** a user has recorded one or more undoable actions in the active
   context, **When** the user selects the baseline opened item, **Then** every
   recorded action in that context is reverted and the application returns to
   the state immediately before the first user action.
5. **Given** a user has undone one or more actions, **When** the user completes a
   new undoable action, **Then** the previously undone actions are removed from
   the stack and can no longer be redone while earlier undo history remains.

---

### User Story 5 - Handle Failed or Interrupted Actions Safely (Priority: P2)

As a user, I need failed, canceled, or partially completed actions to avoid
corrupting undo history so undo always represents real, completed changes.

**Why this priority**: Undo must be trustworthy across normal success paths and
failure paths, especially when actions may validate, queue, or depend on an
external detail before becoming visible.

**Independent Test**: Trigger validation failures, canceled actions, repeated
actions while work is pending, and external-detail failures; verify undo history
only records completed user-visible state changes and remains consistent after
errors.

**Acceptance Scenarios**:

1. **Given** a user action fails validation, **When** the user invokes undo,
   **Then** the failed action is not present in undo history.
2. **Given** a user action starts but does not complete, **When** the active
   context reports undo availability, **Then** only previously completed actions
   are exposed as undoable.
3. **Given** a completed action is followed by a failed action, **When** the user
   invokes undo, **Then** the completed action is reversed and the failed action
   is ignored.

## Constitution Alignment *(mandatory)*

### Application Action and Boundary Impact

- **Primary application action or use case**: Undo the most recent completed
  user-originated state change for the active tab and active template, catalog,
  and theme reference context; redo undone actions; and move to a selected
  recent-action history point.
- **Queue entry points**: User-invoked undo, redo, and history-list selection
  commands; user-originated editable actions that create undo entries after
  successful completion; lifecycle context changes that select the active undo
  stack.
- **Policy ownership**: Application policy owns which actions are undoable, how
  undo entries are grouped by context, when entries are recorded, and how a
  prior state is restored without components owning mutation rules.
- **App/adapters touched**: App shell commands, tab and editor viewmodels,
  action dispatch, handlers, controllers, and passive renderer summaries that
  display undo availability.
- **External details touched**: Disk-backed runtime persistence for undo stack
  information, startup clearing of prior-session undo state, and any existing
  file, IPC, or service changes caused by undoable actions behind their current
  boundaries.
- **Model touch points**: Runtime models for undoable action identity, active
  context identity using existing `*Ref` types, undo entry metadata, ordered
  history state, action-generated before/after diffs, and user-visible undo/redo
  availability.

### Dependency and Exception Check

- **Inward dependency preserved**: Undo policy remains independent of component
  frameworks, storage, transport, and external service details; disk persistence
  remains a replaceable adapter while policy owns diff creation and history
  rules.
- **Documented architecture exception used**: None.
- **Directive/test sync required**: Architecture and convention enforcement must
  cover undo action flow, policy-owned mutation, read-only renderer summaries,
  context-scoped history, and failure-path recording rules.
- **Refactoring expected while implementing**: Existing state-changing workflows
  that bypass named action flow, store mutation ownership, or passive renderer
  summaries must be aligned before they can participate in undo.

### Edge Cases

- What happens when the active context has no undo history? The undo command is
  unavailable or produces no state change, and the user-visible availability
  state stays accurate.
- What happens on app startup? Persisted undo state from the prior session is
  cleared before the user can interact with undo history.
- What happens if undo history grows too large to keep fully in memory? The app
  may release in-memory undo data after writing stack information to disk, while
  preserving active-session undo, redo, and history-list behavior.
- How does the system handle an action that changes the selected template,
  catalog, theme, version, or tab? The selection change activates the stack for
  the newly active context without deleting the stack for the previous context.
- What happens if the user changes a theme and later returns to the previous
  theme reference? The previous `themeRef` context restores the undo stack it
  had earlier in the same app session.
- What happens if a user completes a new action after undoing one or more
  actions? The undone actions are pruned from the active stack and are no longer
  redoable, while earlier undo history remains available.
- What happens if a user selects an item from the recent-action list? The app
  returns to the state immediately after that item by applying undo or redo for
  each intervening entry in order.
- What happens if a user action is repeated while queue work is still pending?
  Only completed actions are recorded, and pending work does not create duplicate
  or speculative undo entries.
- What happens if an external detail fails after policy validation succeeds? The
  failed action is not recorded as undoable unless the user-visible state was
  successfully changed and can be reversed consistently.
- What happens if undo itself fails to restore a prior state? The application
  keeps the current state consistent, reports the failure through the normal
  workflow feedback, and does not discard the undo entry unless reversal is
  confirmed.
- What happens when an undo reverses an action that affects derived summaries?
  Passive summaries update from explicitly owned state and do not keep their own
  independent undo history.
- What happens if writing undo stack information to disk fails? The original
  action must not be reported as safely undoable unless the app can keep enough
  active-session history to support the same undo and redo guarantees.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a user-invoked undo capability for every
  completed user-originated action that changes application-visible state.
- **FR-002**: System MUST record undo entries only after the corresponding user
  action completes successfully and produces a reversible state change.
- **FR-002A**: System MUST generate undo diffs from the completed action because
  the action owns the context of what state was or was not mutated.
- **FR-002B**: System MUST store before and after state in each undo diff so
  undo and redo can both be performed without whole-application snapshots.
- **FR-003**: System MUST maintain independent undo stacks for each active tab
  and template, catalog, and theme reference context combination, using existing
  `*Ref` types that include `name` and `version`.
- **FR-004**: System MUST switch the active undo stack when the active tab,
  template reference, catalog reference, or theme reference changes.
- **FR-005**: System MUST restore the previous undo stack when the user returns
  to a tab and template, catalog, and theme reference context used earlier in
  the same application session.
- **FR-006**: System MUST keep undo history for the duration of the open
  application session, write undo stack information to disk as it changes, and
  MUST NOT make prior-session undo history available after the application is
  reopened.
- **FR-006A**: System MUST clear persisted undo state on app startup before
  users can interact with undo history.
- **FR-006B**: System MAY release undo data from memory after it is persisted to
  disk, but active-session undo, redo, and history-list behavior MUST remain
  correct.
- **FR-007**: System MUST reverse undoable actions in last-in, first-out order
  within the active context.
- **FR-008**: System MUST allow undone actions to be redone in order until a new
  undoable action is recorded in that context.
- **FR-009**: System MUST remove previously undone actions from the active stack
  when a new undoable action is recorded, while preserving undo history before
  the new action.
- **FR-010**: System MUST expose the active context stack as an ordered list of
  recent actions that the user can select.
- **FR-011**: System MUST return to the state immediately after a selected
  recent-action item by undoing or redoing intervening entries in order.
- **FR-012**: System MUST keep undo and redo history for inactive contexts unchanged when
  the user invokes undo in the active context.
- **FR-013**: System MUST expose accurate user-visible undo and redo availability
  for the active context without allowing passive renderer summaries to own or
  mutate undo history.
- **FR-014**: System MUST handle failed, canceled, rejected, or interrupted
  actions without adding incorrect undo entries.
- **FR-015**: System MUST preserve a consistent state when undo, redo, or
  history navigation fails and MUST avoid losing the targeted entry unless the
  state transition is confirmed.
- **FR-016**: System MUST define or align the named action flow for undo-related
  lifecycle, undo, redo, history-list, and user workflows so components,
  handlers, and controllers do not own undo policy or direct state mutation.
- **FR-017**: System MUST update architecture directives and enforcement tests
  when undo introduces or clarifies action-flow, state-ownership, context-key,
  or failure-path rules.
- **FR-018**: System MUST include failure-path validation for each remediated
  category of undoable action before final validation is considered complete.

### Key Entities *(include if feature involves data)*

- **Undoable User Action**: A completed user-originated action that changed
  application-visible state and has enough policy-owned information to reverse
  that change.
- **Undo Entry**: A session-scoped record representing one reversible completed
  action, its active context at the time of completion, and the user-visible
  change it can reverse.
- **Undo Diff**: Action-generated before/after data for one completed mutation,
  used to reverse or reapply the change without storing a whole application
  state snapshot.
- **Undo Context**: The identity formed from the active tab plus the active
  `templateRef`, `catalogRef`, and `themeRef` values that determine which undo
  stack is active.
- **Undo Stack**: The ordered history of undo entries for one undo context,
  with a current position that supports undo, redo, and pruning undone entries
  when new entries are recorded.
- **Undo Availability Summary**: A read-only user-visible description of whether
  undo or redo is currently available for the active context and, when
  appropriate, what action would be reversed or reapplied.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In acceptance testing, 100% of completed state-changing user
  actions included in the feature scope can be undone from the same active
  context.
- **SC-002**: In cross-context testing, 100% of tab, template, catalog, theme,
  and version switches restore the correct undo availability and do not expose
  entries from another context.
- **SC-003**: Users can undo at least 20 consecutive completed actions in a
  single context in reverse order without losing application-visible consistency.
- **SC-004**: In failure-path testing, 100% of failed, canceled, rejected, or
  interrupted actions avoid creating incorrect undo entries.
- **SC-005**: After closing and reopening the application, 0 prior-session undo
  entries are available, and persisted undo files from the prior session are
  cleared on startup.
- **SC-006**: Final validation includes at least one representative undoable
  workflow each from app shell, catalog, template, and theme areas, plus any
  directly related common workflow required for consistency.
- **SC-007**: In history navigation testing, 100% of selected recent-action list
  items return the active context to the state immediately after the selected
  item.
- **SC-008**: In redo-branch testing, 100% of newly recorded actions after undo
  prune previously undone actions while preserving earlier undo history.
- **SC-009**: In persistence testing, 100% of recorded undo stack changes are
  written to disk before in-memory history for those entries is eligible for
  release.
- **SC-010**: In undo data review, 100% of undoable workflow entries store
  action-generated before/after diffs and 0 whole-application snapshots.

## Assumptions

- "Every user action" means every completed user-originated action that changes
  application-visible state; passive navigation, hover/focus changes, read-only
  inspection, and commands that produce no state change are not recorded as
  undoable entries.
- Context-scoped stacks are keyed by the active tab and the active
  `templateRef`, `catalogRef`, and `themeRef` values visible to the user at the
  time an action completes.
- Undo history is session-only state backed by disk during the open app session;
  persisted undo data is an active-session performance mechanism and is cleared
  on startup rather than restored across sessions.
- Existing named action, handler, controller, and policy-owned operation flows
  are reused where compliant; inconsistent workflows directly related to
  undoable actions are remediated as part of the feature.
- Redo and ordered history-list navigation are in scope for the initial feature.
