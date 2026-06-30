# Contract: Enforcement and Structure

## Purpose

Describe the steady-state structure and enforcement expectations for the
constitutional remediation.

## Structure Contract

- `src/app/` owns callbacks, viewmodels, action dispatch, handlers,
  focused controller use cases, and presentation translation.
- `src/domain/` owns validations, operation ports, mutation ordering,
  invariants, and plain internal workflow models.
- `src/gateway/` owns adapters from application needs to services and external
  detail APIs.
- Services abstract framework, filesystem, network, config-file, IPC, OS, and
  similar volatile operations without owning business policy.
- `electron/` owns desktop-shell details, preload wiring, and IPC boundaries.
- `src/model/` owns typed external or runtime-parsed models when a dedicated
  model module is the clearest boundary location.

## Duplicate Contract Cleanup Rules

- Each touched feature must have one authoritative action-contract module.
- Parallel `components/.../actions/...` compatibility paths are not retained
  once a canonical feature path exists.
- Any moved or consolidated contract path must be updated everywhere in the same
  change set.

## Escape-Hatch Reduction Rules

- Touched `core`, `common`, `shared`, and `utils` modules must expose one
  cohesive concept.
- Business-specific logic found in a generic bucket must move to a capability-
  oriented module during remediation when that bucket obscures ownership.
- Renaming without responsibility cleanup does not satisfy the remediation.

## Enforcement Contract

- Architecture tests must reject domain imports of app-layer queue types,
  continuation helpers, lifecycle controllers, and other renderer-owned details
  targeted by this remediation.
- Architecture tests must also reject top-level authoring handlers that import
  domain operations, gateways, or controller chains directly, and reject
  focused authoring controllers that reach back into actions, peer controllers,
  gateways, or Electron details.
- Convention or structure checks must reject duplicate authoritative action-
  contract paths for the same touched feature.
- Any DI, boundary, naming, or allowed-import rule changed by the remediation
  must be encoded in tests or managed directives.

## Review Contract

- Reviewers must be able to verify the intended architecture through source
  placement, imports, and tests alone.
- No touched flow may rely on an undocumented baseline exception to pass review.
- Final validation is not complete until all task-listed enforcement, routing,
  directive, and failure-path checks have either passed or are explicitly
  documented as not applicable to the touched change set.
