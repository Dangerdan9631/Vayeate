# Data Model: Constitution Compliance Remediation

## Overview

This feature does not introduce new end-user business records. It introduces or
clarifies architectural entities that govern how existing workflows are allowed
to move through the layered system.

## Entities

### Application Action

- **Purpose**: Represents one user-originated or lifecycle-originated intent
  entering the app layer.
- **Fields**:
  - `type`: stable action identifier
  - `payload`: user input or stable identifiers only
  - `origin`: optional source classification such as user callback or lifecycle
    event
- **Rules**:
  - Must not carry derivable state snapshots
  - Must map to one dominant controller use case
  - Must have one authoritative definition path per touched feature

### Controller Use Case

- **Purpose**: Owns application workflow orchestration for one logical
  application action.
- **Fields**:
  - `name`: responsibility-revealing workflow name
  - `inputs`: typed request model or stable identifiers
  - `validations`: operation-port calls or validation requests made before mutation
  - `operationPorts`: ordered operation-port calls
  - `detailRequests`: boundary calls requested through gateways or services
- **Relationships**:
  - Consumes one or more `Application Action` variants
  - Uses `Operation Port` and `Boundary Contract` seams to reach external details
  - Produces state changes only through operation ports
- **Rules**:
  - One clear reason to change
  - Owns orchestration order and follow-up behavior for the action
  - Must not depend on framework-owned types

### Operation Port

- **Purpose**: Exposes a policy-facing capability seam used by controller use
  cases.
- **Fields**:
  - `name`: capability-revealing operation name
  - `request`: typed request model or stable identifiers
  - `result`: typed result or continuation
- **Rules**:
  - Represents application or domain capability, not framework mechanics
  - Owns state mutation, invariants, and business-rule execution behind the port
  - May delegate volatile detail work through gateways or services
  - Must keep request and result models explicit

### Service Abstraction

- **Purpose**: Abstracts framework, platform, filesystem, network, config-file,
  IPC, OS, or similar volatile operations.
- **Rules**:
  - Does not own business rules
  - Provides replaceable access to volatile framework operations
  - Is adapted by gateways where application translation is needed

### Gateway Adapter

- **Purpose**: Adapts application needs to service abstractions or external
  detail APIs.
- **Rules**:
  - Translates data and failure modes at the boundary
  - Does not decide business policy
  - Keeps service/framework details out of controller use cases and operation
    ports

### Boundary Contract

- **Purpose**: Typed seam used by policy to describe detail work without
  importing volatile infrastructure.
- **Fields**:
  - `requestModel`: typed request shape
  - `responseModel`: typed result or completion shape
  - `errorModel`: typed failure representation when applicable
  - `owner`: policy capability that defines the seam
- **Relationships**:
  - Implemented by outer-edge adapters in app, gateway, or shell code
  - Used by `Controller Use Case` workflows
- **Rules**:
  - Must be owned by inner policy needs
  - Must hide queue, transport, framework, and shell details
  - Must remain replaceable without rewriting business rules

### Lifecycle Translation Event

- **Purpose**: Plain event model representing shell or renderer lifecycle input
  after translation at the boundary.
- **Fields**:
  - `eventType`: translated lifecycle identifier
  - `data`: typed payload for size, position, display, or shortcut input
  - `source`: boundary source identifier
- **Relationships**:
  - Originates from shell or renderer adapters
  - Feeds `Application Action` or `Controller Use Case` entry paths
- **Rules**:
  - Must be plain typed data
  - Must not expose controller classes or framework event objects in policy

### Compliance Finding

- **Purpose**: Tracks a concrete class of constitutional drift targeted by the
  remediation.
- **Fields**:
  - `category`: dependency direction, policy ownership, DI seam, duplicate
    contract, or escape hatch
  - `location`: file or module cluster
  - `remediationTarget`: desired compliant end state
  - `validationRule`: enforcement artifact that proves the fix
- **Relationships**:
  - Resolved by one or more `Controller Use Case`, `Operation Port`, or
    structure changes
  - Verified by an `Enforcement Artifact`

### Enforcement Artifact

- **Purpose**: Test or directive that encodes an architectural rule.
- **Fields**:
  - `ruleName`: clear architectural rule name
  - `scope`: files or folders governed by the rule
  - `failureCondition`: observable regression that must fail validation
  - `supportingDirective`: related constitution or managed directive reference
- **Rules**:
  - Must reflect the desired steady state, not a temporary exception
  - Must be updated in the same change set as any rule change

## State Transitions

### Action Flow Transition

1. A viewmodel callback or lifecycle adapter emits an `Application Action`.
2. An app-layer handler translates and delegates to one `Controller Use Case`.
3. The `Controller Use Case` orchestrates validation through operation ports.
4. The `Controller Use Case` performs ordered operation-port calls and requests
   detail work through `Boundary Contract` seams.
5. Outer adapters execute detail work and translate results back into plain
   models.
6. Enforcement artifacts verify that no step leaked outer details into policy.

### Compliance Remediation Transition

1. Identify a `Compliance Finding`.
2. Replace the violating seam with a typed `Boundary Contract` or focused
   `Controller Use Case` or `Operation Port`.
3. Consolidate any duplicate or stale source path involved in the finding.
4. Update the `Enforcement Artifact` that proves the steady state.
5. Validate behavior preservation and constitutional compliance together.
