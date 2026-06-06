<!--
Sync Impact Report
- Version change: 1.0.1 -> 1.1.0
- Modified principles:
  - I. Layered Desktop Boundaries -> I. Layered Boundaries and Dependency Direction
  - II. Queue-Driven UI Interactions -> II. Use-Case Driven UI and Adapter Flow
  - III. Operations Own Mutation and Business Logic -> III. Policy, Mutation, and Invariant Ownership
  - IV. Shared Validation and Typed Models -> IV. Typed Boundaries and Replaceable Details
  - V. Convention Tests and Directive Sync -> V. Clean Code and Enforceable Quality
- Added sections:
  - Architectural Boundaries
  - Delivery and Refactoring Workflow
- Removed sections:
  - Technical Guardrails
  - Delivery Workflow
- Templates requiring updates:
  - ✅ updated .specify/templates/plan-template.md
  - ✅ updated .specify/templates/spec-template.md
  - ✅ updated .specify/templates/tasks-template.md
  - ✅ reviewed .specify/templates/constitution-template.md
  - ✅ reviewed AGENTS.md
  - ✅ reviewed package.json
  - ✅ reviewed tsconfig.json
  - ✅ reviewed D:/Dan/Source/GitHub/Workspaces/Android/agent-rules-books/clean-code/clean-code.md
  - ✅ reviewed D:/Dan/Source/GitHub/Workspaces/Android/agent-rules-books/clean-architecture/clean-architecture.md
  - ✅ reviewed D:/Dan/Source/GitHub/Workspaces/Android/agent-rules-books/clean-architecture/clean-architecture.mini.md
  - ✅ reviewed D:/Dan/Source/GitHub/Workspaces/Android/agent-rules-books/clean-architecture/clean-architecture.nano.md
- Follow-up TODOs:
  - None
-->
# Vayeate Theme Studio Constitution

## Core Principles

### I. Layered Boundaries and Dependency Direction
Vayeate Theme Studio MUST preserve explicit source-code boundaries.
`electron/` is limited to Electron, OS, preload, window, and IPC details.
`src/app/` owns renderer-facing components, action dispatch, handlers,
controllers, and viewmodels. `src/domain/` owns business rules, invariants,
operations, validations, state transitions, and pure domain helpers.
`src/gateway/` owns adapters over files, IPC, services, and other external
systems. `src/model/` owns typed data shapes and runtime parsing.

Source dependencies MUST point inward toward higher-level policy. Inner policy
code MUST NOT depend on UI libraries, framework artifacts, transport details,
vendor SDKs, storage implementations, queues, operating system APIs, or other
volatile details. Outer layers may depend on inner layers; the reverse is
forbidden unless a narrow exception is documented and justified at the outermost
boundary possible.

Rationale: independent business rules and inward dependencies keep the system
changeable when frameworks, delivery mechanisms, persistence strategies, or
tooling evolve.

### II. Use-Case Driven UI and Adapter Flow
User-originated and lifecycle-originated renderer interactions MUST enter
through viewmodel-owned named callbacks and proceed through the intended action,
handler, controller, and use-case flow unless a documented architecture
exception applies. Components, presenters, controllers, handlers, gateways, and
other adapters MUST stay humble: they translate, delegate, and coordinate, but
they do not own business policy.

Every non-trivial feature MUST reveal a focused application action. Controllers
and handlers MUST translate input into that action, not absorb branching policy.
Action payloads MUST contain user input or stable identifiers only, not state
that can be derived elsewhere. Features SHOULD be organized by business
capability or use case first, even when technical subfolders remain necessary
inside the existing repository layout.

Rationale: the system should scream its use cases and domain intent instead of
hiding policy inside delivery or adapter code.

### III. Policy, Mutation, and Invariant Ownership
Business rules, invariants, and state-changing policy MUST live in the domain
and application policy layers, not in components, handlers, controllers,
gateways, services, persistence code, or Electron wiring. Only operations or
other explicit policy-owned use-case units may mutate domain state. Controllers
MUST orchestrate validations and operations without writing store state, calling
peer controllers, or bypassing policy units to reach external details.

Operations and use-case units MUST stay focused on one logical application
action, with one clear reason to change. Domain objects, validations, and
policy code MUST guard invariants explicitly. Peer operation calls, shared
utility escape hatches, and god-service accumulation are prohibited except for
narrowly documented bridge cases that preserve architectural direction and do
not normalize layering shortcuts.

Rationale: policy concentrated in focused, inward code keeps invariants visible,
testable, and resistant to framework or adapter drift.

### IV. Typed Boundaries and Replaceable Details
Persisted, external, or runtime-parsed data MUST be represented through typed
models and validated at the boundary. Use plain internal request, response, and
state models across policy boundaries. Framework objects, raw persistence rows,
transport payloads, and vendor-specific types MUST be translated at the edge and
MUST NOT leak into core policy.

External systems such as filesystems, IPC, clocks, storage, messaging, network
clients, service SDKs, and device integration MUST sit behind explicit ports,
gateways, or adapters owned by inner policy needs. Object construction,
dependency wiring, and framework bootstrap belong at the outer edge. Details
must remain replaceable without rewriting business rules.

Rationale: typed, explicit boundaries protect the core from accidental coupling
to unstable implementation details.

### V. Clean Code and Enforceable Quality
All touched code MUST become clearer, safer, and easier to change. Names MUST
reveal intent. Functions, methods, classes, modules, and use-case units MUST
stay small, focused, and cohesive, with one clear responsibility and one clear
reason to change. Hidden side effects, boolean control flags, misleading names,
deep nesting, train-wreck navigation, comment-heavy structure, duplicated logic,
and generic dumping grounds are defects that MUST be reduced rather than carried
forward.

Comments are allowed only when they add information the code cannot express
well, such as rationale, warnings, external protocol constraints, or legal
requirements. Tests are production-quality code and MUST remain readable,
deterministic, and proportionate to behavior risk. Architectural conventions and
their enforcement artifacts MUST stay synchronized with the constitution and the
implementation.

Rationale: clean structure is not cosmetic; it is the mechanism that keeps the
architecture understandable and sustainable under continuous change.

## Architectural Boundaries

- The standard stack is TypeScript, React, Vite, Electron, tsyringe, zustand,
  zod, ESLint, and Vitest as defined by the repository's current package and
  compiler configuration.
- Dependency injection for controllers, operations, validations, gateways, and
  services MUST use explicit composition with concrete ownership and minimal
  interfaces. String or symbol based indirection is forbidden unless it is a
  documented infrastructure seam with clear substitution value.
- React component files in the app layer MUST use PascalCase filenames and one
  primary exported component. Non-component source modules MUST use kebab-case
  filenames aligned with the primary export or module concept.
- Services and gateways MUST remain free of business rules. They translate and
  integrate; they do not decide policy.
- Features MUST preserve the established top-level source layout while making
  use-case ownership visible within that layout. Generic `common`, `core`,
  `shared`, or `utils` areas MUST NOT become escape hatches for misplaced
  policy or sideways coupling.
- The lightest enforceable boundary SHOULD be chosen for each volatile detail,
  but every important dependency direction, policy boundary, and replacement seam
  MUST be visible in code, tests, or structure rather than only in diagrams or
  conventions.

## Delivery and Refactoring Workflow

- Every specification MUST describe the user journey, the primary application
  action or use case, the layers touched, the affected policy objects, the
  boundary translations involved, and the validation strategy for the feature.
- Every implementation plan MUST include a constitution check covering
  dependency direction, layer placement, queue entry points, policy ownership of
  mutation, typed boundary translation, replaceable-detail seams, and required
  enforcement updates.
- Every task list MUST include the work needed to maintain architectural and
  clean-code quality. When a change affects directives, boundary rules, naming,
  DI seams, allowed exceptions, or enforcement, the task list MUST explicitly
  include the matching documentation and test updates.
- Refactoring MUST proceed in small, behavior-preserving steps. Teams MUST move
  policy inward, split god objects by use case or responsibility, and remove
  duplication, misleading names, and accidental complexity as part of normal
  delivery work.
- Validation is required before merge. At minimum, changes MUST pass applicable
  tests, linting, and relevant architectural or convention checks. Business-rule
  and use-case tests MUST run without real framework, network, vendor, or
  persistence details whenever practical.

## Governance

This constitution governs delivery inside `vayeate-theme-studio` and supersedes
template defaults, stale project notes, and convenience-driven deviations.
Maintained architectural directives and enforcement artifacts may refine these
rules, but they MUST NOT weaken them without an explicit constitution amendment.

Amendments MUST be made in the same change set as their dependent updates. That
includes the constitution itself, affected directive artifacts, relevant Spec
Kit templates, and any architecture, convention, or boundary tests that encode
the changed rule.

Versioning policy for this constitution follows semantic versioning:
- MAJOR for incompatible governance or architectural principle changes.
- MINOR for new principles, sections, or materially expanded obligations.
- PATCH for clarifications, wording improvements, and non-semantic refinements.

Compliance review is mandatory for every plan and implementation review.
Reviewers MUST verify all of the following before approval:
- business rules remain independent from volatile details
- dependencies point inward
- use cases and policy ownership remain visible
- adapters stay humble
- touched code is cleaner than before
- tests and enforcement remain proportionate and synchronized

**Version**: 1.1.0 | **Ratified**: 2026-06-06 | **Last Amended**: 2026-06-06
