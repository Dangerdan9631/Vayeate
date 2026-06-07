# Quickstart: Constitution Compliance Remediation

## Purpose

Validate that the remediation preserves current behavior while bringing the
touched flows into constitutional compliance.

## Prerequisites

- Install dependencies:

```powershell
npm install
```

- Work from the repository root:

```powershell
cd D:\Dan\Source\GitHub\Dangerdan9631\Vayeate\vayeate-theme-studio
```

## Validation Workflow

### 1. Verify architecture boundaries

Run the architecture and policy-oriented tests that should catch dependency and
ownership regressions:

```powershell
npm test -- --run test/architecture/layer-boundaries.test.ts
npm test -- --run src/domain/baseline-policy.test.ts
npm test -- --run src/app/catalog/catalog-flow-routing.test.ts src/app/template/template-flow-routing.test.ts src/app/theme/theme-renderer-workflows.test.tsx
npm test -- --run src/app/core/queues/baseline-queues.test.ts test/electron/ipc-handlers.test.ts test/electron/preload.test.ts src/main.test.tsx
```

Expected outcome:
- No touched domain file imports app-layer queue, lifecycle, or controller
  details covered by the remediation.
- Top-level authoring handlers remain translation-only entry points and focused
  authoring controllers do not chain through peer controllers or outer-detail
  adapters.
- Policy-oriented tests still pass after workflow ownership moves inward.

### 2. Verify lint and full automated validation

```powershell
npm run lint
npm test
```

Expected outcome:
- Lint passes without new structural or naming regressions.
- The full test suite passes, including workflow-routing and renderer behavior
  tests touched by the remediation.

### 3. Review callback-to-controller-use-case flow

Inspect representative remediated flows and confirm the contract documented in
[contracts/use-case-boundaries.md](./contracts/use-case-boundaries.md):

- One catalog workflow
- One template workflow
- One theme workflow
- One lifecycle or queue-driven workflow

Expected outcome:
- Each flow enters through a named callback and action.
- One focused controller use case owns validation flow, operation-port
  orchestration, and detail requests.
- Mutation rules and invariants remain behind operation ports rather than in
  handlers, components, services, or gateways.
- Handlers, components, services, and gateways no longer own multi-step business
  scripts for the remediated flow.
- Persistence, preview, export, or other outer-detail failures after validation
  still surface through the controller-use-case boundary and do not move business
  error policy into services, gateways, or UI adapters.

### 4. Review repository structure and enforcement

Inspect the paths covered by
[contracts/enforcement-and-structure.md](./contracts/enforcement-and-structure.md).

Expected outcome:
- Touched duplicate action-contract paths are removed or consolidated.
- Generic escape-hatch modules touched by the remediation have clearer,
  capability-oriented ownership.
- Tests encode the new steady state without baseline-exception allowlists.

### 5. Spot-check behavior preservation

Launch the app and exercise one representative workflow each for catalogs,
templates, themes, and shell lifecycle behavior.

```powershell
npm run dev
```

Expected outcome:
- Existing user-visible authoring behavior still works.
- Refactored flows behave the same from the user perspective while using the new
  internal architecture.

### 6. Confirm final task-order integrity

Before marking final validation complete, confirm all foundational, user-story,
enforcement, directive-sync, and failure-path validation tasks in
`tasks.md` are complete. Earlier targeted test runs are partial validation only
until this checklist passes.

For this remediation, the minimum final command set is:

```powershell
npm run lint
npm test
```
