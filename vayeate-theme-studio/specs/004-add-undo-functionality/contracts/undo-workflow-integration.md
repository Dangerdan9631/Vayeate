# Contract: Undo Workflow Integration

## Required Flow

Every state-changing user workflow that participates in undo follows the
project's canonical action flow:

1. Component forwards the user event to one named viewmodel callback.
2. Viewmodel translates the event into user intent and dispatches a validated
   action.
3. Handler routes the validated action to one focused controller use case.
4. Controller orchestrates validations, read-only state access, and policy-owned
   operations.
5. Policy operation performs the state change, generates before/after diffs
   from action-owned mutation context, and records a history entry only after
   the change completes successfully.
6. Undo, redo, and history-list navigation transition state through policy-owned
   history operations.
7. Renderer summaries read updated undo/redo availability and ordered recent
   actions from explicitly owned state.

Lifecycle-triggered context changes that select the active undo stack must use
the named action flow unless a documented exception applies.

## Responsibilities

### Components

- Render undo, redo, ordered history-list commands, disabled states, and
  summaries.
- Attach events to viewmodel callbacks.
- Do not snapshot whole policy state for undo.
- Do not decide whether a domain change is reversible.

### Viewmodels

- Expose intent-revealing callbacks for undo, redo, history-list selection, and
  editable actions.
- Dispatch validated actions with user input or stable identifiers only.
- Derive read-only availability for the component.
- Do not own undo stack mutation.

### Handlers

- Delegate each history-related action case to one controller use case.
- Avoid business branching about reversibility, context identity, or history
  retention.
- Do not record undo entries directly.

### Controllers

- Orchestrate active context reads, validations, history position reads, and
  operation calls.
- Keep one logical use case per controller.
- Do not write undo store state directly unless the controller is an explicit
  use-case boundary for selecting read-only active context state.

### Policy Operations

- Own mutation, invariant checks, history entry creation, undo, redo, history
  navigation, and branch-pruning logic.
- Generate focused before/after diffs from action context.
- Use plain data and stable identifiers at policy boundaries.
- Keep external details replaceable and out of undo policy decisions.

### Gateways and External Details

- Remain adapters for app data workflows that already require external details.
- Persist active-session undo stack information as it changes.
- Clear prior-session persisted undo state on startup.
- Report external failures so policy can avoid recording incorrect undo entries.

## Workflow Classification

Each candidate user action must be classified before implementation closure:

- `undoable`: completed state-changing action with reversible policy data.
- `not-state-changing`: navigation, hover, focus, read-only inspection, or other
  command that produces no application-visible state change.
- `not-reversible`: state-changing action that cannot safely be reversed in the
  initial feature, requiring explicit deferral and rationale.
- `deferred`: action intentionally excluded from initial implementation with
  evidence and follow-up rationale.

## Required Coverage

Implementation must include at least one undoable workflow each from:

- app shell
- catalog
- template
- theme

Directly related common workflows must be included when they create or commit
state changes that feed those areas.

## Enforcement Triggers

Directive and architecture/convention tests must be updated when implementation
introduces or clarifies any of these rules:

- undo entries are session-only
- undo stacks are context-scoped by active tab and existing `*Ref` values
- state-changing actions declare undo/redo history participation
- ordered history-list selection transitions through policy operations
- new actions after undo prune redoable branch entries
- undo data uses action-generated before/after diffs rather than whole-state
  snapshots
- stack changes are written to disk and prior-session persisted state is cleared
  on startup
- failed or pending actions do not create undo entries
- renderer summaries are read-only
- lifecycle context-selection uses named action flow
