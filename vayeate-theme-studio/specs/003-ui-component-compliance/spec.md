# Feature Specification: UI Component Compliance Remediation

**Feature Branch**: `[003-ui-component-compliance]`

**Created**: 2026-06-07

**Status**: Draft

**Input**: User description: "Create a new spec. Review the remaining todo items in Todo.md. This is a checklist of things I needed to check for compliance with architectural and constitutional guidance. Review those items and define the spec to bring any violations into compliance."

## Clarifications

### Session 2026-06-07

- Q: Should remediation preserve existing behavior when older working flows conflict with newer app patterns? -> A: Prioritize whole-app consistency; use current constitutional guidance and newer git-history patterns over legacy behavior that merely works.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Verify Remaining Component Workflow Compliance (Priority: P1)

As a maintainer, I need every unchecked component workflow from `Todo.md` and any directly related inconsistent app workflow to be reviewed against the current architectural and constitutional guidance so that actual violations are separated from items that already match the newer canonical pattern.

**Why this priority**: The checklist is the minimum authoritative unresolved inventory for this pass. Implementation work should not begin by assuming that every unchecked line is still a violation, but every unchecked line and any related inconsistent pattern must be accounted for.

**Independent Test**: Review the unchecked common, shell, catalog, template, and theme component entries plus directly related inconsistent workflows and verify that each item is classified as aligned with the canonical pattern, remediated, or intentionally deferred with a concrete reason.

**Acceptance Scenarios**:

1. **Given** the unresolved checklist items and related inconsistent app workflows, **When** the compliance review is completed, **Then** every affected component has a recorded result for action routing, viewmodel ownership, component simplicity, local UI state, controller granularity, failure behavior, and alignment with the newer canonical pattern.
2. **Given** a component already satisfies the current guidance and newer pattern, **When** it is reviewed, **Then** the result records the evidence and does not require churn-only remediation.
3. **Given** a working component uses an older inconsistent pattern, **When** it is reviewed, **Then** the inconsistency is treated as a remediation requirement rather than preserved solely because the current behavior works.

---

### User Story 2 - Bring Component Interactions Into the Required Action Flow (Priority: P1)

As a maintainer, I need user and lifecycle interactions in the remaining component workflows to enter through named callbacks and follow the action, handler, controller, and policy-owned operation flow so that components and handlers stay translation-focused.

**Why this priority**: The remaining checklist is concentrated in renderer component flows. If interactions bypass the intended flow, business behavior can drift into components, handlers, or presentation logic.

**Independent Test**: Select one workflow from each affected area and verify the interaction is expressed as a named viewmodel callback, translated into a validated action, handled by a single controller call for that action case, and completed by focused policy-owned behavior.

**Acceptance Scenarios**:

1. **Given** a user triggers a catalog, template, theme, shell, or common component interaction, **When** the interaction is processed, **Then** the component delegates to a single named callback rather than owning branching business behavior.
2. **Given** a validated component action is handled, **When** the handler processes the action, **Then** each action case delegates to one focused controller use case.
3. **Given** a controller use case performs meaningful behavior, **When** it executes, **Then** it orchestrates validation, state reads, and policy-owned operations without shifting business rules into presentation or adapter code.

---

### User Story 3 - Standardize App Workflows While Reducing Component Complexity (Priority: P2)

As a maintainer, I need the component cleanup to make the whole app consistent with newer patterns while reducing complex conditions, unnecessary nested data, duplicated UI logic, and unclear naming so that future changes remain understandable.

**Why this priority**: The compliance pass should improve maintainability and consistency even when an older working behavior or internal flow must change to match the current architectural direction.

**Independent Test**: For each affected component area, exercise the primary user workflow after remediation and verify it follows the same canonical interaction model used by the newest compliant workflows while preserving intended product capability.

**Acceptance Scenarios**:

1. **Given** existing component workflows for common overlays, app shell controls, catalog authoring, template authoring, and theme authoring, **When** remediation is complete, **Then** users can complete the intended product tasks through consistent interaction patterns across the app.
2. **Given** a component has local-only UI state, **When** the state is reviewed, **Then** it is either kept local with a clear reason or moved into an appropriate component UI state store when shared coordination is required.
3. **Given** repeated actions, concurrent pending work, or user cancellation, **When** the workflow is exercised, **Then** the user sees predictable state and no duplicated or contradictory updates.

## Constitution Alignment *(mandatory)*

### Application Action and Boundary Impact

- **Primary application action or use case**: Review and remediate renderer component workflows so each user or lifecycle interaction has a visible, validated application action and focused controller use case when the interaction is non-trivial, and so all app areas converge on the newer canonical pattern.
- **Queue entry points**: Component callbacks that can start background work, continuation behavior, or save/load flows in the unchecked inventory must retain predictable pending, success, cancellation, and failure states.
- **Policy ownership**: Domain validations, operations, and policy-owned use cases continue to own business rules, mutation, and invariants; component viewmodels own UI coordination only.
- **App/adapters touched**: Common overlays and tooltips; shell, menu, ribbon, and status components; catalog, template, and theme component workflows listed as unchecked in `Todo.md`; their viewmodels, action contracts, handlers, controllers, and workflow evidence.
- **External details touched**: Only the replaceable details already used by these workflows, such as save/load, preview, window, clipboard, pointer, color-picking, and background-work boundaries, where component interactions currently expose or depend on them.
- **Model touch points**: Validated action payloads, viewmodel inputs, component UI state, workflow status, and failure or cancellation results that cross a boundary.

### Dependency and Exception Check

- **Inward dependency preserved**: Component and adapter code may translate user intent, but policy behavior, mutation ordering, and invariants remain behind inward-owned validations, operations, or use-case units.
- **Documented architecture exception used**: None planned. Any discovered exception must be explicitly justified and tracked before implementation proceeds.
- **Directive/test sync required**: Required if the review discovers missing enforcement for component-owned business logic, handler branching, local UI state rules, naming conventions, action-contract ownership, or controller granularity.
- **Refactoring expected while implementing**: Reduce complex component conditions, unclear callback names, unnecessary nested viewmodel objects, duplicated action contract paths, mixed presentation and policy logic, older inconsistent workflow behavior, and controller use cases with more than one reason to change.

### Edge Cases

- What happens when an unchecked todo item is already compliant and only lacks recorded evidence?
- How does the system handle a component action with an invalid or stale payload?
- What happens if the user repeats an action while related work is pending?
- What happens if a user cancels or closes an overlay or dialog after validation but before work completes?
- What happens if an external detail fails after policy validation succeeds?
- How are components with purely local visual state distinguished from components that need coordinated UI state?
- How is the newer canonical pattern selected when current working behavior and newer git-history patterns conflict?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST account for every unchecked component item in `Todo.md` and any directly related inconsistent app workflow across common, app shell, catalog, template, and theme areas before the feature is considered complete.
- **FR-002**: The system MUST classify each reviewed item as aligned with the canonical pattern, remediated, or intentionally deferred with a specific reason and validation evidence.
- **FR-003**: Each non-trivial component workflow MUST expose a named user or lifecycle callback that translates intent into a validated action instead of embedding business decisions in presentation code.
- **FR-004**: Each validated action case MUST delegate to one focused controller use case, and each controller use case MUST restrict itself to orchestration of validation, state reads, and policy-owned operations.
- **FR-005**: Component viewmodels MUST own UI coordination and derived presentation state, while components remain focused on rendering, local effects, and event forwarding.
- **FR-006**: Shared or coordinated component UI state MUST have explicit ownership; local-only state MAY remain local when it does not cross workflow boundaries or hide policy behavior.
- **FR-007**: Remediated workflows MUST prioritize whole-app consistency with current constitutional guidance and newer git-history patterns over preserving older behavior solely because it works.
- **FR-008**: Failure, cancellation, stale input, invalid input, and repeated-action paths MUST be validated for every remediated workflow category.
- **FR-009**: Compliance enforcement MUST be updated when the remediation changes or clarifies rules for action contracts, handlers, viewmodels, controllers, state ownership, or component naming.
- **FR-010**: Directive artifacts MUST be synchronized when the implementation introduces or clarifies architectural rules, allowed exceptions, naming conventions, or validation expectations.
- **FR-011**: The final feature validation MUST include focused workflow evidence for every remediated workflow category and at least one common component, one shell component, one catalog component, one template component, and one theme component.
- **FR-012**: When multiple working patterns exist, the system MUST identify the canonical pattern using the constitution, the completed `002` remediation, newer git-history evidence, and current consistent implementations before tasks are finalized.

### Key Entities *(include if feature involves data)*

- **Component Workflow**: A user-visible or lifecycle-triggered interaction owned by a component area from the remaining checklist.
- **Compliance Inventory Item**: One unchecked todo entry or directly related inconsistent workflow that must be classified, remediated when necessary, and backed by evidence.
- **Validated Action Contract**: The boundary representation of user intent for a component workflow, including payload validation and ownership.
- **Viewmodel Callback**: A named entry point that receives component events, coordinates UI state, and dispatches intent without owning business policy.
- **Focused Controller Use Case**: The app-layer orchestration unit for one logical action, limited to validation, state reads, and policy-owned operation calls.
- **Component UI State**: Local or shared presentation state whose ownership must be explicit and must not hide policy mutation.
- **Compliance Evidence**: Tests, review notes, or enforcement results that prove the inventory item now satisfies the constitution.
- **Canonical Pattern Evidence**: Current constitutional guidance, newer git-history context, or existing compliant workflow evidence used to resolve conflicts between older and newer app patterns.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of unchecked `Todo.md` component inventory items and directly related inconsistent workflows have a final classification and evidence record.
- **SC-002**: 100% of remediated non-trivial workflows follow the named callback, validated action, single handler case delegation, focused controller use case, and policy-owned operation flow.
- **SC-003**: At least one representative workflow from each affected area passes validation that it preserves intended product capability while aligning with the canonical app pattern.
- **SC-004**: 100% of remediated workflow categories include validation for invalid input, repeated action, cancellation or close behavior, and external-detail failure where applicable.
- **SC-005**: Compliance enforcement and directive artifacts show no known drift after remediation is complete.
- **SC-006**: 100% of pattern conflicts discovered during review record the selected canonical pattern and the evidence used to choose it.

## Assumptions

- The unchecked items in `Todo.md` are the minimum authoritative inventory for this new compliance pass.
- Items already completed by the previous constitution remediation may be marked aligned only when they match the current canonical pattern with evidence.
- The scope covers component-level common, app shell, catalog, template, and theme workflows plus directly related inconsistent app workflows needed to make the app consistent; core queue and lifecycle remediation remains governed by the completed `002` feature unless a component workflow exposes a new gap.
- The implementation should preserve intended product capability, but existing behavior or structure may change when required to make the whole app consistent with newer constitutional patterns.
- Existing architecture and workflow tests are reusable evidence where they directly cover an unchecked item or canonical pattern; missing evidence requires targeted validation.
- When pattern recency is unclear, use git history and current compliant implementations to determine the newer canonical direction before writing implementation tasks.
