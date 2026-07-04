# Component Workflow Inventory

This inventory treats the unchecked component entries in `Todo.md` as the
minimum authoritative scope for feature `003`. Every listed component has a
final classification, evidence source, and canonical-pattern decision. The only
directly related inconsistent workflow found during review was app-shell
lifecycle load/unload bypassing the app action flow.

| Area | Component or workflow | Criterion | Status | Evidence | Reason / canonical decision |
| --- | --- | --- | --- | --- | --- |
| Common | `eyedropper-overlay` | action contract, handler routing, viewmodel ownership, state ownership, complexity | aligned | `src/app/actions/Common/eyedropper-overlay/*`, `src/app/viewmodel/Common/eyedropper-overlay/use-eyedropper-overlay-viewmodel.ts`, `src/app/common/eyedropper-overlay/eyedropper-overlay-flow-routing.test.ts` | Existing named callbacks, validated actions, focused handler routes, and explicit `EyedropperUiStore` ownership already match the canonical flow. |
| Common | `styled-tooltip` | action contract, handler routing, viewmodel ownership, state ownership, complexity | aligned | `src/app/actions/Common/styled-tooltip/*`, `src/app/viewmodel/Common/styled-tooltip/use-styled-tooltip-viewmodel.ts`, `src/app/common/styled-tooltip/styled-tooltip-flow-routing.test.ts` | Existing tooltip callbacks, action guard path, handler routing, and `StyledTooltipUiStore` ownership already match the newer shell interaction pattern from `a061327`. |
| App | `app-shell` | action contract, handler routing, lifecycle ownership, component simplicity | remediated | `src/app/actions/Common/app-shell/app-shell-action-type.ts`, `src/app/actions/Common/app-shell/app-shell-handler.ts`, `src/app/viewmodel/Common/app-shell/use-app-shell-viewmodel.ts`, `src/app/app/app-shell/app-shell-renderer-workflows.test.tsx` | Shell window and theme actions were already aligned. Lifecycle load/unload was remediated to dispatch named app-shell actions instead of resolving controllers directly from the viewmodel. |
| App | `menu-bar` | action contract, handler routing, callback ownership, local UI state | aligned | `src/app/actions/Common/menu-bar/*`, `src/app/viewmodel/Common/menu-bar/use-menubar-viewmodel.ts`, `src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx` | Menu interactions already route through named callbacks to validated actions, one handler route per case, and focused controllers. Local refs remain local-only renderer state. |
| App | `ribbon` | action contract, handler routing, callback ownership, complexity | aligned | `src/app/actions/Common/ribbon/*`, `src/app/viewmodel/Common/ribbon/use-ribbon-viewmodel.ts`, `src/app/app/ribbon/ribbon-renderer-workflows.test.tsx` | Tab switching already uses one named callback, a focused action contract, and a thin handler/controller path. |
| App | `status-bar` | state ownership, component simplicity, non-trivial action applicability | aligned | `src/app/components/Common/status-bar/StatusBar.tsx`, `src/app/viewmodel/Common/status-bar/use-status-bar-viewmodel.ts`, `src/app/app/status-bar/status-bar-renderer-workflows.test.tsx` | Status bar behavior is a read-only derived renderer view over queue UI stores. No separate non-trivial action contract is required because the component does not own mutation or branching policy. |
| Catalog | `bulk-add-dialog` | action contract, handler routing, callback ownership, state ownership | aligned | `src/app/actions/Catalog/bulk-add-dialog/*`, `src/app/viewmodel/Catalog/bulk-add-dialog/use-bulk-add-dialog-viewmodel.ts`, `src/app/catalog/catalog-flow-routing.test.ts` | Dialog open, close, text edit, and submit paths already use named callbacks, validated actions, and explicit UI store ownership. |
| Catalog | `catalog-details-card` | action contract, handler routing, callback ownership, controller granularity | aligned | `src/app/actions/Catalog/catalog-details-card/*`, `src/app/viewmodel/Catalog/catalog-details-card/use-catalog-details-card-viewmodel.ts`, `src/app/catalog/catalog-flow-routing.test.ts` | Source edits, lock, sync, delete, and revert paths already delegate one action case to one focused controller use case. |
| Catalog | `catalog-page` | lifecycle action flow, page state ownership | aligned | `src/app/actions/Catalog/catalog-page/*`, `src/app/viewmodel/Catalog/catalog-page/use-catalog-viewmodel.ts`, `src/app/catalog/catalog-flow-routing.test.ts` | Page load already dispatches through a named page action and keeps page/dialog state ownership explicit in UI stores. |
| Catalog | `catalogs-card` | action contract, callback ownership, selection flow | aligned | `src/app/actions/Catalog/catalogs-card/*`, `src/app/viewmodel/Catalog/catalogs-card/use-catalogs-card-viewmodel.ts`, `src/app/catalog/catalog-flow-routing.test.ts` | Selection and create paths already follow named callbacks, validated actions, and focused controller routing. |
| Catalog | `create-dialog` | action contract, callback ownership, state ownership | aligned | `src/app/actions/Catalog/create-dialog/*`, `src/app/viewmodel/Catalog/create-dialog/use-create-catalog-dialog-viewmodel.ts`, `src/app/catalog/catalog-renderer-workflows.test.tsx` | Dialog input and close/submit behavior already use explicit dialog UI state and focused action routes. |
| Catalog | `tokens-card` | action contract, callback ownership, controller granularity, complexity | aligned | `src/app/actions/Catalog/tokens-card/*`, `src/app/viewmodel/Catalog/tokens-card/use-tokens-card-viewmodel.ts`, `src/app/catalog/catalog-flow-routing.test.ts` | Token add/remove/search and semantic token edits already follow the canonical callback-to-action-to-handler-to-controller path. |
| Template | `create-template-dialog` | action contract, callback ownership, state ownership | aligned | `src/app/actions/Template/create-template-dialog/*`, `src/app/viewmodel/Template/create-template-dialog/use-create-template-dialog-viewmodel.ts`, `src/app/template/template-renderer-workflows.test.tsx` | Create dialog naming, submit, and close behavior already use explicit dialog state plus one action route per intent. |
| Template | `groups-card` | action contract, callback ownership, controller granularity | aligned | `src/app/actions/Template/groups-card/*`, `src/app/viewmodel/Template/groups-card/use-groups-card-viewmodel.ts`, `src/app/template/template-flow-routing.test.ts` | Group add/remove/search paths already use thin handlers and focused controllers. |
| Template | `mappings-card` | action contract, callback ownership, controller granularity, complexity | aligned | `src/app/actions/Template/mappings-card/*`, `src/app/viewmodel/Template/mappings-card/use-mappings-card-viewmodel.ts`, `src/app/template/template-flow-routing.test.ts` | Mapping search and mutation paths already route through validated actions and focused controllers without handler-owned policy branching. |
| Template | `template-catalogs-card` | action contract, callback ownership, controller granularity | aligned | `src/app/actions/Template/template-catalogs-card/*`, `src/app/viewmodel/Template/template-catalogs-card/use-template-catalogs-card-viewmodel.ts`, `src/app/template/template-flow-routing.test.ts` | Catalog toggle/version/update actions already align with the canonical authoring pattern. |
| Template | `template-details-card` | action contract, callback ownership, controller granularity | aligned | `src/app/actions/Template/template-details-card/*`, `src/app/viewmodel/Template/template-details-card/use-template-details-card-viewmodel.ts`, `src/app/template/template-flow-routing.test.ts` | Lock and delete-version workflows already delegate one case to one focused controller. |
| Template | `template-page` | lifecycle action flow, page state ownership | aligned | `src/app/actions/Template/template-page/*`, `src/app/viewmodel/Template/template-page/use-template-viewmodel.ts`, `src/app/template/template-flow-routing.test.ts` | Page load already dispatches through a validated page action and keeps load state in explicit UI stores. |
| Template | `templates-card` | action contract, callback ownership, selection flow | aligned | `src/app/actions/Template/templates-card/*`, `src/app/viewmodel/Template/templates-card/use-templates-card-viewmodel.ts`, `src/app/template/template-flow-routing.test.ts` | Template selection and create-dialog open behavior already follow the canonical list-card pattern. |
| Template | `variables-card` | action contract, callback ownership, controller granularity, complexity | aligned | `src/app/actions/Template/variables-card/*`, `src/app/viewmodel/Template/variables-card/use-variables-card-viewmodel.ts`, `src/app/template/template-flow-routing.test.ts` | Variable search and edits already use named callbacks, validated actions, and focused controllers. |
| Theme | `create-theme-dialog` | action contract, callback ownership, state ownership | aligned | `src/app/actions/Theme/create-theme-dialog/*`, `src/app/viewmodel/Theme/create-theme-dialog/use-create-theme-dialog-viewmodel.ts`, `src/app/theme/theme-renderer-workflows.test.tsx` | Theme create dialog behavior already follows the explicit dialog-state and focused action path used in template create. |
| Theme | `editor-previews-card` | action contract, callback ownership, external-detail seam ownership | aligned | `src/app/actions/Theme/editor-previews-card/*`, `src/app/viewmodel/Theme/editor-previews-card/use-editor-previews-card-viewmodel.ts`, `src/app/theme/theme-renderer-workflows.test.tsx` | Preview token selection remains renderer coordination only; preview loading stays behind focused controller/use-case flow. |
| Theme | `theme-details-card` | action contract, callback ownership, controller granularity | aligned | `src/app/actions/Theme/theme-details-card/*`, `src/app/viewmodel/Theme/theme-details-card/use-theme-details-card-viewmodel.ts`, `src/app/theme/theme-renderer-workflows.test.tsx` | Generate, delete, version, and template-change flows already route through focused controllers. |
| Theme | `theme-page` | lifecycle action flow, page state ownership | aligned | `src/app/actions/Theme/theme-page/*`, `src/app/viewmodel/Theme/theme-page/use-theme-viewmodel.ts`, `src/app/theme/theme-renderer-workflows.test.tsx` | Theme page load already dispatches through a validated page action and keeps page state explicit in UI stores. |
| Theme | `theme-palette-card` | action contract, callback ownership, local-only UI state, complexity | aligned | `src/app/actions/Theme/theme-palette-card/*`, `src/app/viewmodel/Theme/theme-palette-card/use-theme-palette-card-viewmodel.ts`, `src/app/theme/theme-renderer-workflows.test.tsx` | Significant local-only palette presentation state remains local by design, while all non-trivial intent still leaves through named callbacks and validated actions. |
| Theme | `theme-variables-card` | action contract, callback ownership, controller granularity, state ownership | aligned | `src/app/actions/Theme/theme-variables-card/*`, `src/app/viewmodel/Theme/theme-variables-card/use-theme-variables-card-viewmodel.ts`, `src/app/theme/theme-renderer-workflows.test.tsx` | Variable selection and assignment edits already use explicit UI store ownership and focused controller routing. |
| Theme | `themes-card` | action contract, callback ownership, selection flow | aligned | `src/app/actions/Theme/themes-card/*`, `src/app/viewmodel/Theme/themes-card/use-themes-card-viewmodel.ts`, `src/app/theme/theme-renderer-workflows.test.tsx` | Theme selection and create-dialog open already match the canonical list-card pattern. |
| App | `app-shell lifecycle load/unload` | direct inconsistent workflow discovered during review | remediated | `src/app/viewmodel/Common/app-shell/use-app-shell-viewmodel.ts`, `src/app/actions/Common/app-shell/app-shell-action-type.ts`, `src/app/actions/Common/app-shell/app-shell-handler.ts`, `src/app/app/app-shell/app-shell-renderer-workflows.test.tsx` | Superseded older direct controller resolution in the viewmodel with named lifecycle actions handled by `AppShellHandler`, matching the page-load pattern already used in catalog, template, and theme pages. |

## Validation Record

- Focused common evidence: `src/app/common/styled-tooltip/styled-tooltip-flow-routing.test.ts`,
  `src/app/common/eyedropper-overlay/eyedropper-overlay-flow-routing.test.ts`
- Focused shell evidence: `src/app/app/app-shell/app-shell-renderer-workflows.test.tsx`,
  `src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx`,
  `src/app/app/ribbon/ribbon-renderer-workflows.test.tsx`,
  `src/app/app/status-bar/status-bar-renderer-workflows.test.tsx`
- Focused catalog evidence: `src/app/catalog/catalog-flow-routing.test.ts`,
  `src/app/catalog/catalog-renderer-workflows.test.tsx`
- Focused template evidence: `src/app/template/template-flow-routing.test.ts`,
  `src/app/template/template-renderer-workflows.test.tsx`
- Focused theme evidence: `src/app/theme/theme-renderer-workflows.test.tsx`
- Enforcement evidence: `test/architecture/layer-boundaries.test.ts`,
  `test/architecture/component-workflow-compliance.test.ts`
- Domain failure-path evidence: `src/domain/catalog-token-operations.test.ts`,
  `src/domain/template-utils.test.ts`, `src/domain/baseline-policy.test.ts`,
  `src/domain/component-ui-state-ownership.test.ts`

## Review Outcomes

- Existing typed boundary models were sufficient for this pass. The reviewed
  component workflows already use explicit boundary/state models through
  `src/model/app-ui.ts`, `src/model/styled-tooltip.ts`,
  `src/model/eyedropper.ts`, and `src/model/Theme/theme-pane-state.ts`.
- No additional shared policy-operation or validation gap was found in
  `src/domain/**` beyond the shell lifecycle flow already remediated at the app
  boundary. The remaining reviewed authoring and theme failure paths were
  addressed by focused tests rather than new domain seams.
- No additional common, catalog, template, or theme runtime remediation was
  required after the evidence pass. The remaining unchecked implementation
  buckets in `tasks.md` closed through source review, architecture coverage,
  renderer workflow coverage, and domain failure-path tests rather than
  churn-only rewrites.
- No obsolete deferred markers, temporary scaffolding, stale action contracts,
  or duplicate workflow helpers were confirmed in the reviewed touched areas.

### 2026-06-07 Validation Results

- `npm test -- src/app/common/styled-tooltip/styled-tooltip-flow-routing.test.ts src/app/common/eyedropper-overlay/eyedropper-overlay-flow-routing.test.ts` -> pass
- `npm test -- src/app/app/app-shell/app-shell-renderer-workflows.test.tsx src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx src/app/app/ribbon/ribbon-renderer-workflows.test.tsx src/app/app/status-bar/status-bar-renderer-workflows.test.tsx` -> pass
- `npm test -- src/app/catalog/catalog-flow-routing.test.ts src/app/template/template-flow-routing.test.ts src/app/theme/theme-renderer-workflows.test.tsx test/architecture/layer-boundaries.test.ts test/architecture/component-workflow-compliance.test.ts` -> pass
- `npm test -- test/architecture/component-workflow-compliance.test.ts src/domain/component-ui-state-ownership.test.ts src/domain/catalog-token-operations.test.ts src/domain/template-utils.test.ts src/domain/baseline-policy.test.ts` -> pass
- `npm run lint` -> pass
- `npm test` -> pass (`23` files, `84` tests)
