# Contract: Component Workflow Boundaries

## Required Interaction Flow

Every non-trivial component workflow in the remaining checklist, and every
directly related inconsistent app workflow discovered during review, must follow
this contract:

1. A component receives a user or lifecycle event and forwards it to one named
   viewmodel callback.
2. The viewmodel callback translates the event into user intent, coordinates
   local presentation state when needed, and dispatches a validated action for
   non-trivial behavior.
3. The action guard accepts only user input or stable identifiers needed for the
   workflow.
4. The handler validates the action route and delegates each case to one focused
   controller use case.
5. The controller orchestrates validations, read-only state access, and
   policy-owned operations.
6. Operations, validations, and domain policy own mutation, invariants, and
   business rules.
7. Gateways, services, and shell details remain replaceable adapters and do not
   decide policy.

## Responsibility Contract

### Components

- Render current presentation state.
- Attach events to viewmodel callbacks.
- Hold only local effects or local-only visual state.
- Do not branch on business rules or mutate policy state.

### Viewmodels

- Name user intent clearly through callbacks.
- Derive presentation state for components.
- Coordinate local UI state.
- Dispatch validated actions for meaningful workflows.
- Do not own domain invariants or persistence rules.

### Action Contracts

- Define stable action identifiers.
- Guard payload shape.
- Carry user input or stable identifiers only.
- Stay in one canonical action path per workflow family.

### Handlers

- Translate validated action cases.
- Call one focused controller use case per case.
- Avoid policy branching, mutation ordering, and direct external-detail work.

### Controllers

- Orchestrate validations, read-only state access, and policy-owned operations.
- Keep one logical action and one clear reason to change.
- Do not call peer controllers, write stores directly, or bypass operations to
  reach volatile details.

### Policy Operations

- Own state-changing behavior, business rules, and invariants.
- Expose plain inputs and outputs across policy boundaries.
- Use replaceable ports for external details.

### External Details

- Translate to and from files, windows, pointers, previews, queues, or other
  volatile details only at the edge.
- Preserve failure and cancellation results in forms that policy or controllers
  can handle explicitly.

## Failure-Path Contract

Each remediated workflow category must validate applicable failure paths:

- invalid action payload
- stale selected entity or missing identifier
- repeated user action while related work is pending
- cancellation or close after validation starts
- external-detail failure after policy validation succeeds
- local visual state reset after close, cancel, completion, or failure

## Exception Contract

No ongoing architecture exception is planned. If implementation discovers a
required exception, the exception must be:

- documented with a narrow scope
- justified by why the compliant flow cannot be used
- covered by enforcement or explicit review evidence
- synchronized with directives before final validation

## Canonical Pattern Contract

When two working patterns conflict, the implementation must choose the canonical
pattern from these sources, in order:

1. Current constitution and managed directives.
2. Completed `002` remediation artifacts and enforcement.
3. Newer git-history evidence that shows the intended current pattern.
4. Current compliant implementations that satisfy the boundary contract.

Older behavior must not be preserved solely because it works. It may remain only
when it matches the selected canonical pattern or when a documented exception is
approved and enforced.

## Review Closure Contract

Evidence-backed review may close a remediation or standardization task without a
runtime code change when all of the following are true:

- the workflow already matches the selected canonical pattern
- focused workflow and enforcement tests cover the relevant interaction surface
- state ownership is already explicit and proportional
- no handler-, component-, gateway-, or controller-owned policy drift is found
- no duplicate action-contract path or stale helper remains in the touched area

This feature's final review found only one confirmed runtime conflict:
`app-shell` lifecycle load/unload bypassing the named action flow. The reviewed
common, catalog, template, and theme workflows otherwise closed through
evidence, not churn-only rewrites.
