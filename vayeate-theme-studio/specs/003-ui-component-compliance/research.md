# Research: UI Component Compliance Remediation

## Decision: Treat `Todo.md` as the minimum evidence inventory before changing code

**Rationale**: The unchecked component items identify the minimum set that still
needs compliance review, but the completed `002` remediation, recent git history,
and current source tree show that app areas may contain both newer compliant
patterns and older working patterns. Classifying first prevents churn-only
rewrites while still requiring older inconsistent behavior to be changed when it
conflicts with the canonical direction.

**Alternatives considered**:

- Rewrite every unchecked component immediately. Rejected because it risks
  unnecessary churn and obscures which constitutional rule or canonical pattern
  was actually violated.
- Ignore already implemented action and handler files until tasks are generated.
  Rejected because the feature's primary value is complete inventory
  accountability.

## Decision: Prefer newer canonical patterns over older working behavior

**Rationale**: The user clarified that the goal is whole-app consistency and
that existing behavior should not be preserved solely because it works. When
multiple working patterns exist, implementation should choose the canonical
pattern using the constitution, the completed `002` remediation, recent git
history, and current compliant implementations. Recent history shows
constitution compliance remediation and newer styled-tooltip work as important
signals for the current direction.

**Alternatives considered**:

- Preserve old behavior unless it is visibly broken. Rejected because it would
  keep the app inconsistent and contradict the clarified goal.
- Choose canonical patterns only from current file layout. Rejected because git
  history may be needed to distinguish newer intentional patterns from legacy
  remnants.

## Decision: Standardize on the callback to action to handler to controller flow

**Rationale**: The constitution requires user and lifecycle interactions to
enter through viewmodel-owned named callbacks and proceed through validated
actions, handlers, and focused controller use cases unless an explicit exception
applies. This keeps components and handlers humble while making application
actions visible.

**Alternatives considered**:

- Allow simple handlers to call operations directly. Rejected because it weakens
  controller use-case visibility and invites handler-owned branching policy.
- Allow components to dispatch ad hoc state changes directly for convenience.
  Rejected because it hides user intent and makes workflow validation harder.

## Decision: Keep local-only visual state local only when it matches the canonical pattern

**Rationale**: Some component state is purely local presentation state, such as
open/hover/position details. Moving every local state value into a store would
add indirection without improving compliance. However, local state is acceptable
only when it matches the canonical app pattern and does not preserve an older
inconsistent workflow. State that crosses workflow boundaries, coordinates with
queue or persistence behavior, or hides policy mutation must have explicit
ownership.

**Alternatives considered**:

- Require a component UI state store for every listed component. Rejected because
  it overfits the checklist wording and could create unnecessary global state.
- Leave all current state in place without review. Rejected because hidden
  mutation and cross-workflow coordination are known compliance risks.

## Decision: Validate failure paths by workflow category

**Rationale**: The spec requires invalid input, stale payloads, repeated actions,
cancellation, close behavior, and external-detail failures to be covered where
applicable. Validating these by workflow category keeps the scope manageable
while still protecting the risky paths surfaced by component remediation.

**Alternatives considered**:

- Add exhaustive failure tests for every individual component. Rejected because
  it is disproportionate unless a specific workflow has unique failure behavior.
- Rely only on architecture tests. Rejected because architecture tests cannot
  prove user-visible failure and cancellation behavior.

## Decision: Update enforcement only when the review exposes or clarifies a rule

**Rationale**: The constitution requires enforcement and directive synchronization
when architectural rules, naming, boundary ownership, exceptions, or DI seams
change. The review may find existing tests already cover some todo items, so
new enforcement should be targeted to actual gaps.

**Alternatives considered**:

- Add broad new convention tests before review. Rejected because it can encode
  assumptions that do not match the final classification.
- Skip directive updates unless code changes are large. Rejected because even a
  small rule clarification can create project drift if not synchronized.
