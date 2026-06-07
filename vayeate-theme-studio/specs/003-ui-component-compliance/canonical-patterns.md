# Canonical Patterns

This log records the newer component workflow patterns selected for feature
`003` and the evidence used when older working behavior conflicted with the
current constitutional direction.

## Evidence Sources

1. `./plan.md` and `.specify/memory/constitution.md`
2. `specs/002-constitution-compliance-remediation/plan.md`
3. Recent git history:
   - `f809a0c` `feat: Implement constitution compliance remediation`
   - `a061327` `feat: Add styled tooltip functionality with actions, controllers, and UI state management`
4. Current compliant implementations in `src/app/common/styled-tooltip/`,
   `src/app/catalog/catalog-page/`, `src/app/template/template-page/`, and
   `src/app/theme/theme-page/`

## Selected Patterns

| Pattern | Canonical decision | Superseded older pattern | Evidence |
| --- | --- | --- | --- |
| Callback to action to handler to controller to policy operation | Non-trivial renderer intent must enter through one named viewmodel callback, become one validated action, route through one handler case, and delegate to one focused controller use case. | Direct controller execution from renderer viewmodels or mixed handler policy branching. | Constitution section II, `f809a0c`, `a061327`, existing page and tooltip flows. |
| Lifecycle work uses the same action flow as user interactions | Component mount/unmount lifecycle that triggers meaningful behavior must dispatch named actions instead of resolving controllers directly from the viewmodel. | `use-app-shell-viewmodel.ts` directly resolving `LoadAppController` and `UnloadAppController`. | Constitution section II, current page-load viewmodels, 003 remediation of app-shell lifecycle. |
| Local-only visual state may remain local | Keep transient renderer-only state local when it does not hide business policy or cross workflow boundaries. | Forcing every visual concern into a shared store. | Constitution section III, `a061327`, current tooltip, menu-bar ref, and palette local UI state. |
| Coordinated UI state needs explicit store ownership | Dialog open state, load state, queue state, tooltip state, eyedropper state, preview state, and selection state stay in explicit UI stores or policy-owned state units. | Implicit mutation through components or unowned shared state. | Constitution sections III and IV, `f809a0c`, current catalog/template/theme page patterns. |
| Top-level feature handlers stay as dispatch routers | Top-level catalog/template/theme/app handlers aggregate action families and delegate to the matching sub-handler only. | Top-level handlers calling domain operations, gateways, or peer controllers directly. | `test/architecture/layer-boundaries.test.ts`, current feature handler implementations. |
| Read-only renderer summaries do not need synthetic actions | Components such as `status-bar` that only derive and render state from existing stores may remain actionless if they do not own mutation or business branching. | Introducing no-op action contracts for passive render-only summaries. | Constitution section II, current `status-bar` source review, 003 renderer workflow test. |
| Existing typed boundary models should be reused before adding new ones | Component remediation should reuse explicit models and ui-state boundaries already present in `src/model/**` and `src/domain/state/ui/**` unless a concrete gap is found. | Adding parallel workflow-status or ui-state models without a confirmed missing boundary. | 003 review outcomes, `src/domain/component-ui-state-ownership.test.ts`, current model/store inventory. |

## Pattern Conflict Resolution

- `app-shell` lifecycle load/unload was the only confirmed conflict between the
  current code and the selected canonical pattern.
- Catalog, template, and theme page lifecycle flows already established the
  newer page-load action pattern, so the shell lifecycle was aligned to that
  evidence instead of preserving the older direct-controller behavior.
- Theme palette complexity was reviewed and retained where it remains
  presentation-local, because the business behavior still exits through named
  callbacks and validated actions.
- The remaining common, catalog, template, and theme interaction buckets were
  reviewed to closure without additional runtime changes because the current
  implementations already matched the selected canonical patterns and no stale
  helper or duplicate action-contract path remained in the touched scope.
