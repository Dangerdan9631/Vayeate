# Contract: Inventory and Enforcement

## Inventory Scope

The unchecked component entries in `Todo.md` are the minimum authoritative
inventory for this feature. They include common components, app shell
components, catalog components, template components, and theme components.
Directly related inconsistent app workflows discovered during review are also in
scope when they block whole-app consistency.

The prior `002` constitution remediation remains the authority for completed
queue, lifecycle, and broad operation-port work unless this feature discovers a
new component-level violation that exposes one of those boundaries.

## Classification Contract

Every unchecked inventory item must receive one final classification:

- `aligned`: The item satisfies the current canonical pattern and has evidence.
- `remediated`: The item had a confirmed violation that was fixed.
- `deferred`: The item is not completed in this feature and has a specific,
  non-blocking reason.

An item cannot be marked complete by omission. An unchecked item that is already
covered by existing code or tests still requires evidence that it aligns with
the canonical pattern, not merely evidence that it works.

## Evidence Contract

Acceptable evidence includes:

- a focused workflow test
- a policy or operation test
- an architecture or convention test
- a source review note tied to the inventory item
- a directive update when a rule is clarified
- a documented exception when no compliant alternative is currently viable
- canonical pattern evidence from the constitution, `002` remediation, recent
  git history, or current compliant implementations

Final validation must include evidence for at least one common, one shell, one
catalog, one template, and one theme workflow.

## Enforcement Update Triggers

Architecture, convention, or workflow enforcement must be updated when the
feature changes or clarifies any of the following:

- component-owned business logic rules
- viewmodel callback ownership
- action guard and payload ownership
- duplicate or stale action-contract paths
- handler case delegation rules
- controller granularity rules
- local versus coordinated component UI state rules
- failure-path validation expectations
- naming conventions for touched modules
- allowed exceptions or directive wording
- selected canonical pattern when older and newer working flows conflict
- lifecycle-triggered workflows that bypass the named action flow
- renderer-only summary components that are intentionally read-only and do not
  require synthetic action contracts

## Directive Synchronization Contract

Directive artifacts must be synchronized when implementation changes the rules
used by future agents or contributors. At minimum, `AGENTS.md` must point to the
current feature plan while this feature is active. Any new or clarified rule
must be reflected in the relevant Spec Kit artifacts and architecture or
convention tests before final validation is marked complete.

Passive renderer summaries may remain actionless only when they are read-only
views over explicitly owned store state and do not own mutation, policy
branching, or external-detail coordination.

## Completion Contract

The feature is not complete until:

- every unchecked `Todo.md` component item has a final classification
- every directly related inconsistent app workflow discovered during review has
  a final classification
- every confirmed constitutional violation is remediated or explicitly deferred
  with a reason that does not block final validation
- every pattern conflict records the selected canonical pattern and evidence
- remediated workflow categories include applicable failure-path validation
- enforcement and directive synchronization have no known drift
- final lint and relevant tests have been run and recorded
