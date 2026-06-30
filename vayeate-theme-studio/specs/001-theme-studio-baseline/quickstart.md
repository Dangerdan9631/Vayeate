# Quickstart: Theme Studio Baseline Validation

## Purpose

Use this guide to validate the current application behavior end to end against
the baseline specification.

## Prerequisites

- Repository dependencies installed
- Electron-capable local environment
- Existing sample data in `data/` and `previews/`

## Startup

Run the desktop application in development mode:

```powershell
npm run electron:dev
```

Optional validation commands:

```powershell
npm run lint
npm run test
```

Automated baseline validation now covers:

- persisted artifact fixtures and schema parsing in `src/model/schema/baseline-artifacts.test.ts`
- renderer bootstrap and queue registration harnesses in `src/main.test.tsx`
- queue and orchestration baselines in `src/app/core/queues/baseline-queues.test.ts`
- catalog renderer workflows in `src/app/catalog/catalog-renderer-workflows.test.tsx`
- catalog token mutation and validation coverage in `src/domain/catalog-token-operations.test.ts`
- catalog action/controller routing coverage in `src/app/catalog/catalog-flow-routing.test.ts`
- template renderer workflows in `src/app/template/template-renderer-workflows.test.tsx`
- template action/controller routing coverage in `src/app/template/template-flow-routing.test.ts`
- template utility and dialog-state coverage in `src/domain/template-utils.test.ts`
- theme renderer workflows in `src/app/theme/theme-renderer-workflows.test.tsx`
- preview resolution, display-color, app-config, and undo-history baselines in `src/domain/session-and-preview-baseline.test.ts`
- session shell and color-scheme renderer workflows in `src/app/app/menu-bar/menu-bar-renderer-workflows.test.tsx`
- policy and export behavior in `src/domain/baseline-policy.test.ts`
- catalog dialog operation state transitions in `src/domain/catalog-create-dialog-operations.test.ts`
- gateway, preview, config, and window seams in `src/gateway/baseline-gateways.test.ts`
- Electron preload and IPC bridge coverage in `test/electron/preload.test.ts` and `test/electron/ipc-handlers.test.ts`
- repository layer-boundary enforcement in `test/architecture/layer-boundaries.test.ts`

## Validation Scenarios

### 1. Catalog Authoring

1. Open the `Catalogs` workspace.
2. Create a new catalog with a valid unique name.
3. Confirm the catalog appears in the list with an initial version.
4. For a manual catalog, add tokens, edit token keys, search tokens, and use
   the bulk-add flow.
5. For a remote catalog, add or edit source definitions and run sync.
6. Confirm the resulting catalog can be reselected after reload.

Expected outcome:

- Catalog versions remain selectable.
- Invalid or unsupported edits are blocked.
- Token counts and semantic token registries remain coherent.

### 2. Template Composition

1. Open the `Templates` workspace.
2. Create a new template with a valid unique name.
3. Include one or more catalog versions.
4. Add groups, color variables, and contrast variables.
5. Assign mappings for theme, textmate, and semantic tokens.
6. Add semantic variants and confirm modifiers or languages persist.

Expected outcome:

- Included catalogs drive the mapping surface.
- Template changes persist across reload.
- Orphaned mappings are surfaced rather than silently removed.

Reference:

- [data-model.md](./data-model.md)
- [contracts/persisted-artifacts.md](./contracts/persisted-artifacts.md)

### 3. Theme Authoring and Versioning

1. Open the `Themes` workspace.
2. Create a new theme with a valid unique name.
3. Select a template and version.
4. Edit color and contrast assignments for dark and light modes.
5. Use grouped selection, palette controls, and picker-based assignment flows.
6. Increment the version and confirm the earlier version remains intact.

Expected outcome:

- Theme edits persist automatically.
- Variable state, palette behavior, and version progression remain coherent.

### 4. Preview Validation

1. With a theme bound to a template, open the preview area.
2. Assign preview-role token references such as editor foreground,
   background, tabs, line numbers, selection, and menus.
3. Browse sample files and compare dark and light panes.
4. Hover rendered tokens to inspect resolution context.

Expected outcome:

- Both panes stay synchronized to the same sample.
- Preview-role changes are reflected immediately.
- Token rendering aligns with theme assignments.

Reference:

- [contracts/generated-theme-exports.md](./contracts/generated-theme-exports.md)

### 5. Theme Generation

1. Run the theme generation action from the selected theme.
2. Confirm a success or failure message is shown.
3. Verify that dark and light export files are written to the export location.

Expected outcome:

- Exactly two generated artifacts are produced for a successful generation.
- Failures are explicit and do not terminate the session.

### 6. Session Continuity

1. Make edits across catalogs, templates, and themes.
2. Use undo, redo, and history navigation from the menu.
3. Toggle color scheme and use reload actions.
4. Restart the application and reload the edited items.

Expected outcome:

- Persisted state survives restart.
- History navigation restores earlier states in-session.
- Desktop shell controls remain functional.

## Baseline Automation Notes

- Empty sentinel files such as `.gitkeep` are allowed in persisted artifact directories and are ignored by schema-oriented validation.
- Invalid JSON artifacts should remain non-fatal at load boundaries; the automated gateway tests verify that malformed catalog or config content falls back safely instead of entering app state.
