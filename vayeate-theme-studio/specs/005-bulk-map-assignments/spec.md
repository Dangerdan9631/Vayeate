# Feature Specification: Bulk Template Mapping Assignments

**Feature Branch**: `[005-bulk-map-assignments]`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "On the template tab, I want to be able to select more than one template mapping and apply the same action to all selected mappings, including group, color-variable, or contrast-variable assignments."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Assign One Value to Multiple Mappings (Priority: P1)

As a template editor, I can select multiple editable mappings and assign a group,
color variable, or contrast variable once so that the assignment is applied to
every selected mapping.

**Why this priority**: Repeating the same assignment row by row is the primary
cost this feature removes.

**Independent Test**: Select mappings from more than one token type, perform
each supported assignment, and verify every selected mapping receives the chosen
value while unselected mappings remain unchanged.

**Acceptance Scenarios**:

1. **Given** an editable template and two or more selected mappings, **When** the user assigns a group, **Then** every selected mapping has that group and no unselected mapping changes.
2. **Given** selected mappings with different color-variable assignments, **When** the user assigns a color variable, **Then** every selected mapping has the chosen color variable.
3. **Given** selected mappings with different contrast-variable assignments, **When** the user assigns a contrast variable, **Then** every selected mapping has the chosen contrast variable.
4. **Given** selected mappings, **When** the user clears one of the three supported assignments, **Then** that assignment is removed from every selected mapping.

---

### User Story 2 - Build and Understand a Multi-Selection (Priority: P2)

As a template editor, I can add and remove individual mappings from a selection,
see which mappings are selected, and clear the selection so that I can control
the exact scope of a bulk assignment.

**Why this priority**: Bulk changes are only trustworthy when their target set is
explicit and visible.

**Independent Test**: Select and deselect mappings across groups and token types,
filter the visible list, and verify selection state and the displayed selected
count remain accurate.

**Acceptance Scenarios**:

1. **Given** an editable template, **When** the user selects mappings in different groups or token types, **Then** all selected rows remain visibly identified and the total selected count is shown.
2. **Given** a multi-selection, **When** the user deselects one mapping, **Then** only that mapping leaves the selection.
3. **Given** a multi-selection, **When** the user clears the selection, **Then** no mapping remains selected and bulk assignment is unavailable.
4. **Given** selected mappings that become hidden by search, filter, or collapsed sections, **When** the visible list changes, **Then** those mappings remain selected and are included in the displayed selected count until explicitly deselected or the template context changes.

---

### User Story 3 - Reverse a Bulk Assignment Safely (Priority: P3)

As a template editor, I can undo or redo a bulk assignment as one action so that
I can safely recover every selected mapping's prior value.

**Why this priority**: A bulk edit has a larger impact than a row edit and must
integrate with the current template-scoped history model.

**Independent Test**: Give selected mappings different starting assignments,
apply one bulk assignment, undo once, and verify each mapping regains its own
starting value; redo once and verify the bulk result returns.

**Acceptance Scenarios**:

1. **Given** selected mappings with different prior values, **When** a bulk assignment succeeds and the user undoes once, **Then** every changed mapping regains its own prior value.
2. **Given** an undone bulk assignment, **When** the user redoes once, **Then** the chosen assignment is restored to every mapping changed by that action.
3. **Given** a bulk assignment request that cannot be completed for every target, **When** the action fails validation or persistence, **Then** no target is changed and no undo-history entry is recorded.

## Constitution Alignment *(mandatory)*

### Application Action and Boundary Impact

- **Primary application action or use case**: Apply one group, color-variable, or contrast-variable assignment atomically to a selected set of template mappings.
- **Queue entry points**: Mapping selection changes, selection clearing, and bulk assignment commits originate from named Template mappings-card viewmodel callbacks and enter through mappings-card actions.
- **Policy ownership**: Template-domain operations own selection-state changes, target resolution, all-target validation, atomic mapping mutation, and recording one completed template undo entry.
- **App/adapters touched**: Template mappings-card rows, mappings-card viewmodel, action union and guard, handler, and focused controllers translate user intent and expose selection state.
- **External details touched**: Existing template persistence and undo-history boundaries are reused; no new external integration is required.
- **Model touch points**: Stable mapping identities consist of token type and token key; template UI state represents the selected identities. Existing template, variable-reference, and undo-diff models are reused unless planning identifies a missing typed bulk-assignment request.

### Dependency and Exception Check

- **Inward dependency preserved**: Selection and assignment policy remains independent of React, queues, persistence, and Electron; outer layers translate UI events and persistence details around the domain action.
- **Documented architecture exception used**: Existing template undo replay and recording exceptions only; no new exception is expected.
- **Directive/test sync required**: Existing architecture rules should require no text change. Architecture tests must be updated only if planning identifies a new operation bridge, which should be avoided.
- **Refactoring expected while implementing**: Consolidate duplicated single-mapping and multi-mapping assignment rules behind focused assignment policy so validation, persistence, and undo behavior cannot drift.

### Edge Cases

- Display-only wildcard base rows are not selectable; real semantic mappings and variants are selectable when the template version is editable.
- Read-only or non-latest template versions do not permit selection for mutation or bulk assignment.
- A selection is cleared when the selected template reference changes or the selected template is unloaded.
- Mappings hidden by search, filters, or collapsed sections remain selected and remain bulk-action targets; the selected count prevents hidden scope from being implicit.
- Mappings removed or replaced after selection are ignored as stale identities before mutation, and the action proceeds only if at least one valid selected mapping remains.
- Repeating a bulk assignment while earlier queue work is pending follows normal action-queue ordering, so each action resolves against the current template state in order.
- Assigning a value already held by every selected mapping makes no state change and creates no undo entry.
- If validation or persistence cannot complete the assignment for all valid targets, the operation leaves all targets unchanged and records no history entry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to select and deselect multiple real template mappings across mapping groups, token types, and semantic variants in an editable template.
- **FR-002**: The system MUST visibly distinguish selected mappings and display the total selected mapping count.
- **FR-003**: Users MUST be able to clear the current mapping selection in one interaction.
- **FR-004**: The system MUST preserve selected mapping identities when rows are hidden by search, variable filters, or collapsed sections.
- **FR-005**: The system MUST clear mapping selection when the active template reference changes or the template context unloads.
- **FR-006**: Users MUST be able to assign or clear a group for every selected mapping with one committed action.
- **FR-007**: Users MUST be able to assign or clear a color variable for every selected mapping with one committed action.
- **FR-008**: Users MUST be able to assign or clear a contrast variable for every selected mapping with one committed action.
- **FR-009**: A bulk assignment MUST affect all valid selected mappings and MUST NOT change any unselected mapping.
- **FR-010**: Before mutation, the system MUST validate the complete target set and requested assignment against the active editable template.
- **FR-011**: A bulk assignment MUST be atomic: if any applicable target or requested value makes the complete action invalid or the completed state cannot be persisted, no selected mapping may retain a partial change.
- **FR-012**: A successful bulk assignment MUST create one template-scoped undo-history entry containing the individual before and after values needed to restore every changed mapping.
- **FR-013**: Undoing or redoing a bulk assignment MUST restore or reapply all mapping changes from that assignment as one history transition.
- **FR-014**: The system MUST NOT create an undo entry when a bulk assignment changes no mapping or does not complete successfully.
- **FR-015**: Selection-only interactions MUST NOT alter the template, persist template data, or create undo-history entries.
- **FR-016**: Bulk assignment MUST be unavailable when no mapping is selected or when the active template version is not editable.
- **FR-017**: Display-only mappings that cannot be persisted, including the virtual semantic wildcard base, MUST NOT be selectable as bulk-assignment targets.
- **FR-018**: Selection state mutation and bulk assignment policy MUST follow the existing viewmodel-action-handler-controller-operation flow without adding a new architecture exception.

### Key Entities *(include if feature involves data)*

- **Mapping Selection**: The set of stable token-type and token-key identities selected within the active template context.
- **Bulk Mapping Assignment**: One requested assignment kind and value applied atomically to the selected mapping set.
- **Bulk Assignment Change**: A per-mapping record of its prior and resulting assignment value, used to preserve correctness and support undo and redo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can apply the same group, color-variable, or contrast-variable assignment to 20 selected mappings with one assignment commit.
- **SC-002**: In acceptance testing, 100% of selected valid mappings receive the requested assignment and 0 unselected mappings change.
- **SC-003**: One undo restores every changed mapping from a bulk assignment to its own prior value, and one redo restores the complete bulk result, in 100% of supported assignment scenarios.
- **SC-004**: Selection changes and bulk assignment feedback remain visibly responsive for at least 500 mappings and a selection of at least 100 mappings.
- **SC-005**: Invalid, failed, no-op, and read-only bulk assignment attempts produce 0 partial mapping changes and 0 incorrect undo entries.

## Assumptions

- Multi-selection applies to real mappings in the Template tab's mappings card, including semantic variants, but not to display-only virtual rows.
- Selection is scoped to the active template reference and is transient UI state; it is not persisted between template contexts or app sessions.
- Hidden selected mappings remain in scope because silently dropping them can produce an incomplete bulk update; the selected count communicates that scope.
- The supported bulk mutations are group, color-variable, and contrast-variable assignment or clearing. Mapping deletion and semantic selector editing remain single-target actions unless separately specified.
- Existing template persistence and template-scoped undo infrastructure can represent the completed bulk change without a new external storage mechanism.
