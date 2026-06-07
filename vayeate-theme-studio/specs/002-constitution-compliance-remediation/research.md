# Research: Constitution Compliance Remediation

## Decision 1: Replace domain-to-app queue and lifecycle imports with inward-owned seams

- **Decision**: Represent queue scheduling, continuation, and lifecycle event
  translation through boundary contracts owned by policy needs, with app or
  shell adapters implementing those seams at the outer edge.
- **Rationale**: Current domain code imports app-layer queue classes, queue
  enums, continuation helpers, and window controllers. That violates inward
  dependency rules and makes policy depend on renderer infrastructure.
- **Alternatives considered**:
  - Keep the current seams and document them as permanent exceptions.
    Rejected because the feature goal is full compliance and the constitution
    treats such shortcuts as defects to remove.
  - Move queue and lifecycle infrastructure into the domain unchanged.
    Rejected because infrastructure ownership would still leak volatile delivery
    details into core policy.

## Decision 2: Collapse mixed controller scripts into focused controller use cases

- **Decision**: For touched catalog, template, theme, and shell flows, keep
  controllers as the use cases, but split bloated or mixed controller scripts
  into one focused controller use case per logical action.
- **Rationale**: Several controllers currently read state, compute next data,
  bump versions, persist changes, refresh selections, and clear UI inputs in one
  oversized script. That obscures the use case, mixes policy-facing operation
  orchestration with adapter concerns, and creates multiple reasons to change.
- **Alternatives considered**:
  - Move orchestration into separate domain workflow units.
    Rejected because the project architecture defines controllers as use cases.
  - Keep oversized controllers and add more tests.
    Rejected because better testing does not fix mixed responsibilities.

## Decision 3: Move dependency construction to explicit outer-edge composition

- **Decision**: Keep bootstrap and concrete wiring at the outer edge and reduce
  touched reliance on service-locator access and string-based dependency tokens
  in policy and infrastructure flows.
- **Rationale**: The constitution requires explicit composition with concrete
  ownership and minimal interfaces. Current touched flows rely on container
  lookups and string-token registration that obscure ownership and make seams
  harder to reason about.
- **Alternatives considered**:
  - Preserve string tokens for convenience in all queue and workflow plumbing.
    Rejected because they directly conflict with the constitutional DI rule.
  - Remove DI entirely in one rewrite.
    Rejected because the repository already uses DI widely; remediation should
    improve ownership and clarity without forcing an unrelated framework purge.

## Decision 4: Make enforcement describe the desired steady state, not the baseline exception

- **Decision**: Update architecture and convention tests so they fail on the
  remediated dependency leaks, stale duplicate contracts, and newly prohibited
  structure drift without whitelist-style baseline exceptions.
- **Rationale**: Existing enforcement explicitly tolerates some current
  violations. Until tests encode the target architecture directly, the codebase
  will keep drifting back toward the same shortcuts.
- **Alternatives considered**:
  - Leave tests permissive until all future cleanup is complete.
    Rejected because the remediation would not be enforceable.
  - Add comments in the constitution without changing tests.
    Rejected because guidance without enforcement does not prevent regressions.

## Decision 5: Consolidate duplicate contracts and narrow generic escape hatches

- **Decision**: Remove or consolidate stale duplicate action-contract paths and
  relocate touched business-specific logic out of overly generic `core`,
  `common`, `shared`, or `utils` buckets where those buckets currently obscure
  ownership.
- **Rationale**: Structural drift makes the codebase harder to navigate and
  easier to violate. One authoritative path per touched contract reduces
  ambiguity and improves maintainability.
- **Alternatives considered**:
  - Preserve duplicate contract files for backward compatibility.
    Rejected because these are internal source paths, not public interfaces.
  - Rename generic folders without moving responsibility.
    Rejected because cosmetic changes would not address the ownership problem.

## Final validation note

- Final remediation validation must cover three layers together:
  focused authoring-flow routing tests, shell and queue failure-path tests, and
  architecture enforcement that rejects duplicate action-contract paths plus
  handler or controller ownership drift.
- Renderer bootstrap now composes both queue and lifecycle seams explicitly at
  the outer edge, so validation must include `src/main.test.tsx` in addition to
  the architecture and workflow suites.
