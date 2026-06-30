# Feature Specification: Constitution Compliance Remediation

**Feature Branch**: `[002-constitution-compliance-remediation]`

**Created**: 2026-06-06

**Status**: Draft

**Input**: User description: "Create a new spec. Review the current application code and architecture. Identify places that violate the principals in the constitution and create a specification for the work to fix them. These changes can result in a refactor or a full rewrite of areas of the application. The goal is to bring it to 100% compliance with the constitution."

## Clarifications

### Session 2026-06-07

- Q: What is the canonical architecture mapping for controllers, operations, services, and gateways? → A: Controllers are use cases that orchestrate; operations are ports that own policy-facing mutation capabilities; services abstract framework operations such as filesystem, network, and config files; gateways adapt to services.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deliver Constitution-Compliant Authoring Flows (Priority: P1)

As a maintainer, I can modify catalog, template, theme, app-shell, and preview workflows without crossing layer boundaries or hiding business rules inside adapters, so the existing authoring experience can keep evolving without architectural drift.

**Why this priority**: The current application already works, but several core flows depend on exceptions, inward-boundary violations, and scattered workflow orchestration. Until those are removed, every new feature increases the cost and risk of change.

**Independent Test**: Inspect the catalog, template, theme, queue, and window lifecycle flows and verify that each non-trivial workflow enters through a named application action, routes to a focused controller use case, and keeps business policy out of handlers, services, gateways, and renderer infrastructure.

**Acceptance Scenarios**:

1. **Given** a maintainer changes a catalog, template, or theme workflow, **When** they trace the request from UI callback to completion, **Then** the workflow is expressed through a focused application action and a controller use case that orchestrates operation ports rather than a handler-, service-, gateway-, or component-owned multi-step script.
2. **Given** a maintainer inspects domain code, **When** they review its imports and dependency wiring, **Then** domain modules do not depend on app-layer queue types, app-layer controllers, or framework-managed dependency registration details.
3. **Given** a maintainer runs architectural enforcement checks, **When** the remediation is complete, **Then** the checks fail on new inward-boundary violations instead of allowing the current baseline exceptions.

---

### User Story 2 - Keep External Details Replaceable (Priority: P1)

As a maintainer, I can change queue infrastructure, window callback plumbing, persistence scheduling, and other volatile details without rewriting business rules, so desktop-shell and renderer infrastructure remain replaceable outer details.

**Why this priority**: The constitution requires boundary translation and replaceable details. The current codebase leaks queue and lifecycle details into the domain, which makes policy code depend on specific app-layer infrastructure.

**Independent Test**: Review queue-backed workflows, window initialization, preview loading, and persistence-triggering flows and verify that volatile delivery details are represented through inner-owned seams or boundary models rather than concrete app-layer imports.

**Acceptance Scenarios**:

1. **Given** a use case needs background execution or follow-up behavior, **When** the policy layer requests that work, **Then** it uses a boundary seam owned by policy needs rather than importing app-layer queue classes or continuation helpers.
2. **Given** the application initializes window and keyboard callbacks, **When** lifecycle events are translated into state changes, **Then** the outer boundary owns the callback wiring and policy code consumes translated events instead of depending on app-layer controllers.
3. **Given** persistence, preview, or export work fails after validation succeeds, **When** the failure is surfaced, **Then** the controller-use-case boundary still preserves clear ownership between policy decisions and outer-detail execution.

---

### User Story 3 - Remove Structural Drift and Stale Escape Hatches (Priority: P2)

As a maintainer, I can navigate the repository by business capability and responsibility, so duplicate folder trees, generic dumping grounds, and stale compatibility artifacts do not obscure the intended architecture.

**Why this priority**: Structural drift makes the architecture harder to read and easier to violate. The current source tree contains duplicated action-type paths, broad `utils` and `core` catch-alls, and baseline exceptions that normalize shortcuts.

**Independent Test**: Inspect the touched app, domain, and enforcement folders and verify that obsolete duplicate modules are removed or consolidated, generic areas no longer hide business policy, and naming reflects responsibility.

**Acceptance Scenarios**:

1. **Given** a maintainer looks for the action contract for a feature, **When** they navigate the repository, **Then** there is one authoritative location for that contract instead of parallel or stale duplicate paths.
2. **Given** a maintainer inspects a shared module, **When** they evaluate its responsibility, **Then** it exposes a cohesive concept rather than serving as an escape hatch for unrelated policy or infrastructure code.
3. **Given** a maintainer updates architectural rules, **When** they review the related tests and directives, **Then** the enforcement artifacts reflect the current constitution and no longer encode temporary baseline exceptions as the steady state.

## Constitution Alignment *(mandatory)*

### Application Action and Boundary Impact

- **Primary application action or use case**: Bring existing renderer and desktop workflows into full constitutional compliance without regressing user-visible catalog, template, theme, preview, or shell behavior.
- **Queue entry points**: Catalog, template, and theme page load callbacks; create and delete dialog submissions; preview loading; theme persistence triggers; undo history actions; app bootstrap and window lifecycle callbacks.
- **Policy ownership**: Versioning rules, lock rules, template and theme mutation rules, persistence intent, preview loading intent, queue scheduling intent, and lifecycle-driven state transitions.
- **App/adapters touched**: Viewmodels, action types, handlers, controllers, queue infrastructure, shared renderer modules, lifecycle wiring, and any duplicated or stale action-contract files.
- **External details touched**: Queue runners, persistence scheduling, window and keyboard callbacks, file persistence, preview generation, screenshot capture, and other service or gateway integrations used by the touched flows.
- **Model touch points**: Action payloads, lifecycle event models, queue request or continuation models, persisted authoring records, preview state, and any typed boundary contracts introduced to replace app-layer imports in policy code.

### Canonical Architecture Terms

- **Controllers are use cases**: focused controller classes own application
  workflow orchestration for one user or lifecycle intent and delegate policy
  decisions, mutation, and volatile detail work through operation ports.
- **Operations are ports**: operation classes expose the policy-facing capability
  seams used by controller use cases and own state mutation, invariants, and
  business-rule execution.
- **Services are framework abstractions**: services abstract framework, platform,
  filesystem, network, config-file, and similar volatile operations.
- **Gateways are adapters**: gateways adapt application needs to services and
  external detail APIs without owning business policy.

### Touched Flow Inventory

The measurable "touched" scope for this remediation is the set of files and
workflow clusters named in `tasks.md`. A workflow is non-trivial when it performs
validation, mutation ordering, persistence or preview scheduling, queue
continuation, lifecycle translation, version or lock policy, or follow-up
selection/state refresh beyond direct view state assignment.

### Dependency and Exception Check

- **Inward dependency preserved**: The remediation must remove domain imports of app-layer queue types, continuation helpers, and window controllers, and replace them with inward-facing contracts or outer-boundary orchestration that keeps policy independent from delivery structure.
- **Documented architecture exception used**: None. Existing baseline exceptions are part of the problem to be removed, not a permitted steady-state outcome.
- **Directive/test sync required**: Update the architecture and convention enforcement so the layer-boundary tests no longer whitelist current domain-to-app seams and so any new naming or placement rules introduced by the remediation are encoded in tests or directives.
- **Refactoring expected while implementing**: Split bloated or mixed controller workflow scripts into focused controller use cases, keep operations as clear port seams, move dependency wiring out of domain policy code, eliminate stale duplicate action-contract files, narrow generic `utils` and `core` escape hatches, and clarify responsibility names where current names hide mixed concerns.

### Edge Cases

- What happens when a workflow currently depends on a baseline exception for queue continuation or lifecycle bridging? The remediation must replace the shortcut with an explicit seam before the exception is removed from enforcement.
- How does the system handle behavior-preserving rewrites of large flows? Existing user-visible authoring behavior must remain intact while the internal orchestration is reorganized.
- What happens if a user repeats an action while queue work is already pending? The remediated design must keep queue-entry behavior explicit and preserve the current single-user desktop safety guarantees.
- What happens if an outer-detail integration fails after policy validation succeeds? The resulting error must still be surfaced through the correct controller-use-case boundary rather than pushing error-handling policy down into services, gateways, or UI adapters.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST express every non-trivial catalog, template, theme, preview, app-shell, and window lifecycle workflow through one focused application action and one clear controller use case that orchestrates operation ports.
- **FR-002**: The system MUST remove domain-layer source dependencies on app-layer controllers, queue classes, queue enums, queue continuation helpers, and app-layer action contracts.
- **FR-003**: The system MUST keep dependency injection registration, framework-managed object construction, and other bootstrap concerns at the outer edge rather than inside domain policy modules.
- **FR-004**: The system MUST replace string-based dependency tokens used by touched policy and infrastructure flows with explicit, intention-revealing seams unless a documented infrastructure seam is still required and justified.
- **FR-005**: The system MUST ensure handlers translate actions, controllers own focused use-case orchestration, operations expose policy-facing port capabilities and own mutation/business-rule execution, services abstract framework operations, and gateways adapt to services without owning business rules.
- **FR-006**: The system MUST consolidate bloated or mixed controller scripts for touched flows into focused controller use cases while keeping mutation rules, invariants, and volatile detail access behind operation ports, services, or gateways as appropriate.
- **FR-007**: The system MUST represent queue scheduling, lifecycle callback translation, and continuation behavior through typed boundary contracts owned by inner policy needs instead of leaking renderer infrastructure types into the domain.
- **FR-008**: The system MUST keep persisted data, runtime lifecycle events, and cross-layer requests represented by typed models at the boundary and translated before entering policy code.
- **FR-009**: The system MUST remove or consolidate stale duplicate action-contract files and parallel folder trees so each touched feature has one authoritative action definition path.
- **FR-010**: The system MUST reduce generic escape-hatch areas in touched code by relocating business-specific logic into capability-oriented modules with clear names and cohesive responsibilities.
- **FR-011**: The system MUST preserve current user-visible catalog, template, theme, preview, undo, and app-shell behavior while the internal architecture is refactored or rewritten.
- **FR-012**: The system MUST update architecture, convention, and workflow-validation tests so constitutional compliance is enforceable and baseline exceptions are no longer silently allowed.
- **FR-013**: If the remediation changes any architectural directive, allowed boundary, naming rule, or DI seam, the system MUST update the constitution-dependent directives and tests in the same change set.

### Key Entities *(include if feature involves data)*

- **Application Action**: A named request that enters from a viewmodel callback or lifecycle event and identifies the user or system intent without carrying derivable state.
- **Controller Use Case**: The focused application workflow controller that coordinates validation flow, operation-port calls, and outer-detail requests for one logical application action without directly owning business rules or store mutation.
- **Operation Port**: A policy-facing capability seam used by controller use cases to request domain state changes, queue work, lifecycle translation, persistence intent, or other application operations, with business rules and mutation owned behind the port.
- **Service Abstraction**: A framework or platform abstraction over filesystem, network, config-file, IPC, OS, or similar volatile operations.
- **Gateway Adapter**: An adapter that translates application needs to service abstractions or external detail APIs without deciding business policy.
- **Boundary Contract**: A typed request, event, or port model that lets controller use cases and policy describe needed work without depending on framework or infrastructure details.
- **Compliance Finding**: A concrete instance of architectural drift such as an inward dependency violation, unfocused controller use case, handler/service/gateway-owned business script, duplicated contract file, or generic escape hatch that must be removed or justified.
- **Enforcement Artifact**: A test or maintained directive that encodes an architectural rule and prevents regressions once the remediation is complete.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of touched domain files comply with the constitution’s inward-dependency rule and no longer import app-layer controllers, queue infrastructure, or other renderer-owned details.
- **SC-002**: 100% of touched non-trivial workflows can be traced from callback to completion through a named action and a single focused controller use case without handler-, service-, gateway-, or component-owned business scripting.
- **SC-003**: 100% of updated architecture and convention tests pass without whitelist-style baseline exceptions for the remediated seams.
- **SC-004**: Maintainers can complete a code review of the remediated flows using file structure and tests alone, without relying on undocumented tribal knowledge to understand where policy, adapters, and boundaries belong.

## Assumptions

- The current application behavior described in `001-theme-studio-baseline` remains the behavioral baseline and should be preserved unless a later specification explicitly changes user-visible behavior.
- Full compliance may require incremental refactors in some areas and larger rewrites in others, but the resulting architecture must converge on one steady-state model rather than preserving permanent transitional seams.
- Existing examples of constitutional drift include domain-to-app imports in queue and lifecycle flows, framework-managed DI leaking into policy modules, unfocused controller use cases, handler/service/gateway-owned workflow scripting, stale duplicate action-contract files, and architecture tests that currently permit known violations.
- The remediation scope includes documentation and enforcement updates wherever architectural rules change or previously tolerated exceptions are removed.
