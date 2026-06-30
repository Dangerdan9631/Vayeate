# Contract: Use-Case Boundaries

## Purpose

Define the required callback-to-action-to-controller-use-case flow for the
remediation and the boundary expectations that replace current domain-to-app
leaks.

## Flow Contract

1. Renderer or lifecycle input enters through a named viewmodel callback or
   outer-boundary lifecycle adapter.
2. The app layer creates one authoritative application action for that intent.
3. A handler delegates the action to one focused controller use case.
4. The controller use case orchestrates validation flow, operation-port calls,
   and detail requests.
5. Adapters translate detail results and surface them back to the UI without
   re-owning policy decisions.

## Action Contract Rules

- Every touched non-trivial workflow has one dominant action type.
- Action payloads contain only user input or stable identifiers.
- Touched features have one authoritative action-contract path.
- Duplicate compatibility copies of action contracts are not allowed after the
  remediation.

## Use-Case Contract Rules

- Each touched controller use case owns one logical workflow and one clear reason
  to change.
- Controllers are the use cases and may orchestrate operation ports, validation
  flow, and follow-up behavior for the action.
- Handlers, components, services, and gateways may translate, adapt, or delegate,
  but may not own business scripts, versioning decisions, or mutation ordering.
- Operation ports expose policy-facing capabilities and own state mutation,
  invariants, and business-rule execution behind the port while delegating
  volatile details through gateways, services, and boundary contracts.

## Boundary Contract Rules

- Queue scheduling, continuation, persistence requests, preview loading, and
  lifecycle translation must be requested through typed seams owned by policy
  needs.
- Shell callbacks must be translated to plain event models before entering
  policy code.
- Boundary implementations may live in app, gateway, or shell code, but the
  contract shape must not expose volatile framework or renderer-specific types.

## Validation Contract

- Reviewers can trace each touched flow from callback to controller use case without
  crossing a forbidden inward dependency.
- The authoritative touched-flow inventory is the union of task-listed catalog,
  template, theme, preview, queue, lifecycle, and app-shell paths. A flow is
  considered traced only when the callback, action or lifecycle adapter, handler,
  controller use case, operation-port call, and boundary request are identifiable
  from source structure.
- Architecture tests fail if domain code imports app-layer queue, controller, or
  duplicate action-contract modules covered by the remediation.
- Persistence, preview, export, or other outer-detail failures that occur after
  policy validation must be tested or manually traced to surface through the
  controller-use-case boundary instead of moving error policy into services,
  gateways, or UI adapters.
