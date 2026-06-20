# Research: Bulk Template Mapping Assignments

## Stable selection identity

**Decision**: Identify a selected mapping by token type and token key, scoped to
the active template reference.

**Rationale**: Rows are virtualized, regrouped, filtered, and reconstructed.
Rendered object or row identity is therefore unstable, while the existing
mapping lookup contract already uses token type plus token key.

**Alternatives considered**: Array indexes fail after sorting or filtering.
Persisting entire mapping objects duplicates template state and becomes stale.

## Selection lifetime and visibility

**Decision**: Keep selection when selected rows are hidden by search, filters,
or collapsed sections. Display a selected count and clear selection when the
active template changes or unloads.

**Rationale**: Filtering is a view concern and should not silently alter the
scope of a pending bulk action. Template changes invalidate the identity scope.

**Alternatives considered**: Clearing hidden selections is surprising and makes
cross-group selection impossible. Carrying selection across templates risks
editing unrelated mappings with coincidentally equal identities.

## Bulk interaction model

**Decision**: Add explicit selection affordances to real mapping rows and show
explicit group, color-variable, and contrast-variable bulk controls whenever at
least one mapping is selected. Preserve existing row-level controls as
single-target edits.

**Rationale**: An explicit bulk area communicates scope and avoids making a row
dropdown behave differently depending on selection state. It also exposes a
clear-selection action and selected count.

**Alternatives considered**: Applying a changed row control to all selected rows
is compact but context-dependent and easy to trigger accidentally. Modifier-key
selection alone is inaccessible and undiscoverable.

## Atomic next-state construction

**Decision**: Resolve and validate all targets and construct one complete next
template in domain policy before saving, refreshing refs, or recording history.

**Rationale**: The current persistence and undo workflows operate on complete
templates. Building the next value first prevents partial state and naturally
creates one before/after undo transition.

**Alternatives considered**: Dispatching one existing row action per selected
mapping would create multiple versions, persistence writes, and undo entries,
and could stop halfway through the target set.

## Shared assignment policy

**Decision**: Represent group, color, and contrast assignment as a discriminated
request handled by focused shared mapping-assignment policy. Single-row and bulk
workflows should use the same policy where practical.

**Rationale**: The three current controller flows repeat version, save, refresh,
and undo orchestration. Shared policy prevents validation and edge-case drift
while retaining focused adapters.

**Alternatives considered**: Three independent bulk controllers and operations
would duplicate orchestration. A generic untyped field setter would conceal
domain rules and weaken type safety.

## Compatibility with orphan mappings

**Decision**: Preserve existing behavior: clearing the color assignment of an
orphan mapping removes that mapping. In a bulk action, all such removals and all
other assignment changes occur in the same complete next template.

**Rationale**: Bulk and row edits must not disagree about the same assignment.
The current behavior prevents retaining an unusable orphan with no color.

**Alternatives considered**: Leaving orphan mappings in bulk mode would make
results depend on whether the user edited one row or several.

## Undo and no-op policy

**Decision**: Record one template undo entry after a completed bulk change.
Preserve per-mapping prior values through the complete before/after template
transition. Do not record selection changes, no-op assignments, invalid actions,
or failed actions.

**Rationale**: The user initiated one logical edit and expects one undo. Existing
template undo processing already supports complete template before/after state.

**Alternatives considered**: One entry per mapping makes undo tedious and can
expose partial bulk states. Recording selection adds non-business UI noise.

## Stale and invalid targets

**Decision**: Ignore selected identities that no longer resolve in the current
template, clean them from selection, and proceed only when at least one valid
target remains. Reject the complete action when the requested group or variable
reference is invalid for the active template.

**Rationale**: Stale identities can occur after other ordered actions remove or
rename mappings. They are not valid mutation targets. Invalid assignment values
indicate a malformed or outdated request and must not produce partial output.

**Alternatives considered**: Failing because one target disappeared makes queued
UI interactions brittle. Silently accepting an invalid assignment reference
would violate template integrity.
