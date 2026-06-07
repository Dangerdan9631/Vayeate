# Data Model: UI Component Compliance Remediation

## Compliance Inventory Item

Represents one unchecked item from `Todo.md` or one directly related
inconsistent app workflow that must be accounted for.

**Fields**:

- `area`: Common, App, Catalog, Template, or Theme.
- `component`: Component or workflow name from the checklist.
- `criterion`: The checklist criterion being reviewed, such as action contract,
  handler routing, viewmodel ownership, local UI state, controller granularity,
  failure path, naming, complexity, or canonical pattern alignment.
- `status`: `pending-review`, `aligned`, `remediated`, or `deferred`.
- `evidence`: Test, review note, source reference, or enforcement artifact that
  supports the status.
- `reason`: Required when status is `deferred` or when an unchecked item is
  judged already compliant without code changes.

**Validation Rules**:

- Every unchecked item must receive exactly one final status.
- `aligned`, `remediated`, and `deferred` statuses require evidence.
- `deferred` statuses require a reason and must not hide a known constitutional
  violation needed for final validation.

## Component Workflow

Represents a user-visible or lifecycle-triggered interaction in a component
area.

**Fields**:

- `entryPoint`: Named user or lifecycle callback.
- `action`: Validated application action when the workflow is non-trivial.
- `handlerRoute`: Handler case responsible for translating the action.
- `controllerUseCase`: Focused controller use case for one logical action.
- `policyOwner`: Operation, validation, or policy unit that owns mutation and
  business rules.
- `externalDetails`: Replaceable details touched by the workflow, if any.
- `failurePaths`: Invalid input, stale payload, repeated action, cancellation,
  close behavior, or external-detail failure paths that apply.

**Validation Rules**:

- Non-trivial workflows must have a visible action and controller use case.
- Components and handlers must not own policy decisions or mutation ordering.
- Workflows that touch external details must translate through replaceable seams.

## Viewmodel Callback

Represents a named UI coordination function exposed to a component.

**Fields**:

- `name`: Intent-revealing callback name.
- `input`: User input, local UI signal, or stable identifier.
- `localStateUsed`: Local-only state read or updated by the callback.
- `dispatchesAction`: Whether the callback dispatches a validated action.
- `returnsPresentationState`: Derived view state exposed to the component.

**Validation Rules**:

- Callback names must reveal user intent.
- Callback input must not include state that can be derived elsewhere.
- Viewmodels may coordinate presentation state but must not own business policy.

## Validated Action Contract

Represents the boundary form of a component workflow intent.

**Fields**:

- `type`: Stable action identifier.
- `payload`: User input or stable identifiers only.
- `guard`: Validation rule that accepts or rejects the action shape.
- `owner`: Canonical action module responsible for the contract.

**Validation Rules**:

- Each non-trivial action must have a guard.
- Duplicate or stale action-contract paths are not allowed.
- Payloads must not carry derived state or framework-specific objects.

## Handler Route

Represents a handler case that translates a validated action into one controller
use-case call.

**Fields**:

- `actionType`: Validated action handled by the route.
- `controllerCall`: Single focused controller use case invoked by the route.
- `translationOnlyInputs`: Inputs passed through or translated for the
  controller.

**Validation Rules**:

- Each action case delegates to one controller use case.
- Handlers do not branch on business policy.
- Handler routes do not mutate domain state.

## Focused Controller Use Case

Represents app-layer orchestration for one logical action.

**Fields**:

- `name`: Intent-revealing use-case name.
- `validations`: Validation steps orchestrated by the controller.
- `stateReads`: Read-only state access needed to assemble operation inputs.
- `operations`: Policy-owned operations called by the controller.
- `resultTranslation`: UI-facing result or status update returned or dispatched.

**Validation Rules**:

- Controllers orchestrate validations, state reads, and operations only.
- Controllers do not write store state directly, call peer controllers, or own
  business rules.
- Each controller has one clear reason to change.

## Component UI State

Represents local or shared presentation state owned by a component workflow.

**Fields**:

- `scope`: `local-only` or `coordinated`.
- `owner`: Component, viewmodel, state store, or policy state unit.
- `lifetime`: Interaction, component mount, page session, or persisted state.
- `crossesBoundary`: Whether the state crosses workflow or policy boundaries.

**Validation Rules**:

- Local-only visual state may remain local with evidence.
- Coordinated state must have explicit ownership.
- UI state must not hide policy mutation or persistence behavior.

## Compliance Evidence

Represents proof that an inventory item or workflow satisfies the spec.

**Fields**:

- `kind`: Review note, workflow test, policy test, architecture test,
  convention test, directive update, or source reference.
- `target`: Inventory item, workflow, rule, or artifact covered.
- `result`: Pass, remediated, deferred, or follow-up required.

**Validation Rules**:

- Final validation requires evidence for every inventory item.
- Rule changes require directive and enforcement evidence.
- User-visible workflow changes require behavior validation evidence.

## Canonical Pattern Evidence

Represents proof used to choose the app-wide pattern when multiple working
patterns exist.

**Fields**:

- `source`: Constitution, `002` remediation artifact, git history, current
  compliant implementation, architecture test, or directive artifact.
- `pattern`: The selected canonical interaction or state ownership pattern.
- `supersedes`: Older behavior or structure that should not be preserved.
- `reason`: Why this source establishes the newer or more compliant direction.

**Validation Rules**:

- Pattern conflicts must record canonical pattern evidence before remediation
  tasks are finalized.
- Existing behavior cannot be retained solely because it works when canonical
  pattern evidence points elsewhere.
