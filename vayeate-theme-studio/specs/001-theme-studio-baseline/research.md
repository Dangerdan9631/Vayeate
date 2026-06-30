# Research: Theme Studio Baseline

## Decision 1: Treat local artifact formats as the primary external contracts

**Decision**: Use persisted catalog, template, theme, config, preview, and
generated export files as the main contract surface for planning.

**Rationale**: The application is a desktop authoring tool. Its most important
observable interfaces are the files it reads, writes, and generates, not a
network API.

**Alternatives considered**:

- Focus only on UI flows. Rejected because it would miss the versioned file
  contracts that define durable behavior.
- Treat Electron IPC as the primary contract. Rejected because IPC is an
  internal adapter seam rather than the user-facing durable interface.

## Decision 2: Preserve queue-backed mutation and asynchronous work boundaries

**Decision**: Keep user-driven mutations flowing through actions, controllers,
operations, and background or data I/O queues.

**Rationale**: The current implementation already isolates long-running work
such as loading, saving, syncing, and generation from direct renderer event
handlers. That behavior supports responsiveness and clearer ownership.

**Alternatives considered**:

- Collapse work directly into component callbacks. Rejected because it would
  violate the constitution and blur policy ownership.
- Move all work to synchronous local calls. Rejected because persistence,
  generation, and remote sync paths are volatile and latency-prone.

## Decision 3: Model the product around the catalog -> template -> theme flow

**Decision**: Center design and future tasks on the three-step authoring
progression from token sources to reusable structure to generated output.

**Rationale**: This is the clearest expression of the application’s main use
case and matches the current UI and domain organization.

**Alternatives considered**:

- Organize planning around tabs only. Rejected because tabs are a UI expression
  of the use case, not the use case itself.
- Organize planning around technical layers only. Rejected because it hides the
  business capability under implementation structure.

## Decision 4: Use file-based contracts instead of HTTP-style contract schemas

**Decision**: Document contracts as Markdown specifications for persisted
artifacts and generated outputs instead of OpenAPI-style schemas.

**Rationale**: The project does not expose public web endpoints. The more
useful contract artifacts describe file naming, versioning, and content
expectations in a form aligned with the product.

**Alternatives considered**:

- Create REST-style contracts. Rejected because they do not match the product
  surface.
- Skip contracts entirely. Rejected because the persisted and generated files
  are critical interoperability points.

## Decision 5: Validate through end-to-end authoring scenarios plus policy tests

**Decision**: Future implementation validation should combine renderer-level
workflow checks, linting, and policy-level tests for invariant-heavy logic.

**Rationale**: The product’s value is expressed through interactive workflows,
while correctness depends on versioning, mapping, assignment, and generation
rules that benefit from targeted policy tests.

**Alternatives considered**:

- Only UI validation. Rejected because invariant-heavy policy would be harder
  to isolate and defend.
- Only unit tests. Rejected because the core value also depends on integrated
  desktop workflows and persisted outputs.
