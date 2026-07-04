import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const appRoot = path.join(repoRoot, 'src', 'app');

const inventoryTargets = [
  { area: 'Common', component: '`eyedropper-overlay`' },
  { area: 'Common', component: '`styled-tooltip`' },
  { area: 'App', component: '`app-shell`' },
  { area: 'App', component: '`menu-bar`' },
  { area: 'App', component: '`ribbon`' },
  { area: 'App', component: '`status-bar`' },
  { area: 'Catalog', component: '`bulk-add-dialog`' },
  { area: 'Catalog', component: '`catalog-details-card`' },
  { area: 'Catalog', component: '`catalog-page`' },
  { area: 'Catalog', component: '`catalogs-card`' },
  { area: 'Catalog', component: '`create-dialog`' },
  { area: 'Catalog', component: '`tokens-card`' },
  { area: 'Template', component: '`create-template-dialog`' },
  { area: 'Template', component: '`groups-card`' },
  { area: 'Template', component: '`mappings-card`' },
  { area: 'Template', component: '`template-catalogs-card`' },
  { area: 'Template', component: '`template-details-card`' },
  { area: 'Template', component: '`template-page`' },
  { area: 'Template', component: '`templates-card`' },
  { area: 'Template', component: '`variables-card`' },
  { area: 'Theme', component: '`create-theme-dialog`' },
  { area: 'Theme', component: '`editor-previews-card`' },
  { area: 'Theme', component: '`theme-details-card`' },
  { area: 'Theme', component: '`theme-page`' },
  { area: 'Theme', component: '`theme-palette-card`' },
  { area: 'Theme', component: '`theme-variables-card`' },
  { area: 'Theme', component: '`themes-card`' },
  { area: 'App', component: '`app-shell lifecycle load/unload`' },
];

const viewmodelFiles = [
  'src/app/viewmodel/Common/eyedropper-overlay/use-eyedropper-overlay-viewmodel.ts',
  'src/app/viewmodel/Common/styled-tooltip/use-styled-tooltip-viewmodel.ts',
  'src/app/viewmodel/Common/app-shell/use-app-shell-viewmodel.ts',
  'src/app/viewmodel/Common/menu-bar/use-menubar-viewmodel.ts',
  'src/app/viewmodel/Common/ribbon/use-ribbon-viewmodel.ts',
  'src/app/viewmodel/Common/status-bar/use-status-bar-viewmodel.ts',
  'src/app/viewmodel/Catalog/bulk-add-dialog/use-bulk-add-dialog-viewmodel.ts',
  'src/app/viewmodel/Catalog/catalog-details-card/use-catalog-details-card-viewmodel.ts',
  'src/app/viewmodel/Catalog/catalog-page/use-catalog-viewmodel.ts',
  'src/app/viewmodel/Catalog/catalogs-card/use-catalogs-card-viewmodel.ts',
  'src/app/viewmodel/Catalog/create-dialog/use-create-catalog-dialog-viewmodel.ts',
  'src/app/viewmodel/Catalog/tokens-card/use-tokens-card-viewmodel.ts',
  'src/app/viewmodel/Template/create-template-dialog/use-create-template-dialog-viewmodel.ts',
  'src/app/viewmodel/Template/groups-card/use-groups-card-viewmodel.ts',
  'src/app/viewmodel/Template/mappings-card/use-mappings-card-viewmodel.ts',
  'src/app/viewmodel/Template/template-catalogs-card/use-template-catalogs-card-viewmodel.ts',
  'src/app/viewmodel/Template/template-details-card/use-template-details-card-viewmodel.ts',
  'src/app/viewmodel/Template/template-page/use-template-viewmodel.ts',
  'src/app/viewmodel/Template/templates-card/use-templates-card-viewmodel.ts',
  'src/app/viewmodel/Template/variables-card/use-variables-card-viewmodel.ts',
  'src/app/viewmodel/Theme/create-theme-dialog/use-create-theme-dialog-viewmodel.ts',
  'src/app/viewmodel/Theme/editor-previews-card/use-editor-previews-card-viewmodel.ts',
  'src/app/viewmodel/Theme/theme-details-card/use-theme-details-card-viewmodel.ts',
  'src/app/viewmodel/Theme/theme-page/use-theme-viewmodel.ts',
  'src/app/viewmodel/Theme/theme-palette-card/use-theme-palette-card-viewmodel.ts',
  'src/app/viewmodel/Theme/theme-variables-card/use-theme-variables-card-viewmodel.ts',
  'src/app/viewmodel/Theme/themes-card/use-themes-card-viewmodel.ts',
];

const actionTypeFiles = [
  'src/app/actions/Common/eyedropper-overlay/eyedropper-overlay-action-type.ts',
  'src/app/actions/Common/styled-tooltip/styled-tooltip-action-type.ts',
  'src/app/actions/Common/app-shell/app-shell-action-type.ts',
  'src/app/actions/Common/menu-bar/app-menu-action-type.ts',
  'src/app/actions/Common/ribbon/app-ribbon-action-type.ts',
  'src/app/actions/Catalog/catalog-action-type.ts',
  'src/app/actions/Template/template-action-type.ts',
  'src/app/actions/Theme/theme-action-type.ts',
];

async function readText(relativePath: string): Promise<string> {
  return readFile(path.join(repoRoot, relativePath), 'utf8');
}

async function walk(relativeDir: string): Promise<string[]> {
  const absoluteDir = path.join(repoRoot, relativeDir);
  const entries = await readdir(absoluteDir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const childRelative = path.join(relativeDir, entry.name);
      if (entry.isDirectory()) {
        return walk(childRelative);
      }
      if (!/\.(ts|tsx)$/.test(entry.name) || /\.test\.(ts|tsx)$/.test(entry.name)) {
        return [];
      }
      return [path.join(repoRoot, childRelative)];
    }),
  );
  return nested.flat();
}

describe('component workflow compliance', () => {
  it('tracks every unchecked 003 inventory target in the evidence inventory', async () => {
    const inventory = await readText('specs/003-ui-component-compliance/component-inventory.md');

    for (const target of inventoryTargets) {
      expect(
        inventory.includes(`| ${target.area} | ${target.component} |`),
        `${target.area} ${target.component} missing from component-inventory.md`,
      ).toBe(true);
    }
  });

  it('records canonical-pattern evidence for the newer interaction model', async () => {
    const canonicalPatterns = await readText('specs/003-ui-component-compliance/canonical-patterns.md');

    expect(canonicalPatterns).toContain('f809a0c');
    expect(canonicalPatterns).toContain('a061327');
    expect(canonicalPatterns).toContain('Callback to action to handler to controller to policy operation');
    expect(canonicalPatterns).toContain('Lifecycle work uses the same action flow as user interactions');
    expect(canonicalPatterns).toContain('Read-only renderer summaries do not need synthetic actions');
  });

  it('keeps 003 component workflow contracts internally synchronized', async () => {
    const [plan, inventoryContract] = await Promise.all([
      readText('specs/003-ui-component-compliance/plan.md'),
      readText('specs/003-ui-component-compliance/contracts/inventory-and-enforcement.md'),
    ]);

    expect(plan).toContain('Review and remediate the remaining unchecked component workflow inventory from');
    expect(inventoryContract).toContain('The unchecked component entries in `Todo.md` are the minimum authoritative');
    expect(inventoryContract).toContain('Directive artifacts must be synchronized');
  });

  it('keeps reviewed viewmodels free of direct controller imports', async () => {
    for (const filePath of viewmodelFiles) {
      const source = await readText(filePath);
      expect(source.includes('Controller'), filePath).toBe(false);
    }
  });

  it('keeps reviewed action families on explicit type-guard entry points', async () => {
    for (const filePath of actionTypeFiles) {
      const source = await readText(filePath);
      expect(/export function is[A-Za-z0-9]+Action/.test(source), filePath).toBe(true);
      expect(
        source.includes('new Set<string>(Object.values(') || /is[A-Za-z0-9]+Action\(a\)/.test(source),
        filePath,
      ).toBe(true);
    }
  });

  it('keeps active undo directives synchronized with contracts and tasks', async () => {
    const [agents, historyContract, workflowContract, tasks] = await Promise.all([
      readText('AGENTS.md'),
      readText('specs/004-add-undo-functionality/contracts/undo-history-contract.md'),
      readText('specs/004-add-undo-functionality/contracts/undo-workflow-integration.md'),
      readText('specs/004-add-undo-functionality/tasks.md'),
    ]);

    for (const source of [agents, historyContract, workflowContract, tasks]) {
      expect(source).toContain('action-generated');
      expect(source).toContain('read-only');
    }
    expect(agents).toContain('cleared on startup');
    expect(historyContract).toContain('Startup clears persisted undo state');
    expect(workflowContract).toContain('renderer summaries are read-only');
    expect(tasks).toContain('no placeholder undo actions');
  });

  it('prevents placeholder undo actions and whole-application undo snapshots', async () => {
    const undoSources = await Promise.all([
      readText('src/domain/core/Common/undo-stack-types.ts'),
      readText('src/domain/core/Common/undo-processor.ts'),
      readText('src/domain/core/Common/undo-stack.ts'),
    ]);
    const combined = undoSources.join('\n');

    expect(combined).not.toContain('NOOP');
    expect(combined).not.toContain('UndoActionNoop');
    expect(combined).not.toContain('whole application');
    expect(combined).toContain('UndoDiff');
    expect(combined).toContain('HistoryTransitionResult');
  });

  it('keeps undo summaries read-only and context-scoped', async () => {
    const [stateSource, modelSource] = await Promise.all([
      readText('src/domain/state/Common/undo-stack/undo-stack-state.ts'),
      readText('src/model/Common/undo-history.ts'),
    ]);

    expect(stateSource).toContain('UndoAvailabilitySummary');
    expect(stateSource).toContain('activeContextKey');
    expect(modelSource).toContain('deriveUndoContext');
    expect(modelSource).toContain('templateRef');
    expect(modelSource).toContain('catalogRef');
    expect(modelSource).toContain('themeRef');
  });

  it('tracks representative undo workflow participation across catalog, template, and theme', async () => {
    const workflowSources = await Promise.all([
      readText('src/app/controllers/Catalog/tokens-card/update-token-key-controller.ts'),
      readText('src/app/controllers/Template/variables-card/add-variable-controller.ts'),
      readText('src/app/controllers/Template/groups-card/add-group-and-clear-input-controller.ts'),
      readText('src/app/controllers/Theme/theme-palette-card/assign-color-from-picker-controller.ts'),
      readText('src/app/controllers/Theme/theme-palette-card/record-palette-color-assign-undo.ts'),
      readText('src/app/controllers/Theme/theme-variables-card/set-color-variable-dark-controller.ts'),
    ]);
    const combined = workflowSources.join('\n');

    expect(combined).toContain('RecordCatalogUndoOperation');
    expect(combined).toContain('RecordTemplateUndoOperation');
    expect(combined).toContain('RecordThemeUndoOperation');
    expect(combined).toContain('CATALOG_TOKEN_KEY_UPDATED');
    expect(combined).toContain('TEMPLATE_COLOR_VARIABLE_ADDED');
    expect(combined).toContain('TEMPLATE_GROUP_ADDED');
    expect(combined).toContain('THEME_PALETTE_COLOR_ASSIGNED');
    expect(combined).toContain('THEME_COLOR_VARIABLE_DARK_SET');
  });

  it('keeps universal undo coverage enforcement artifacts synchronized', async () => {
    const [exclusions, spec, workflowContract, tasks] = await Promise.all([
      readText('test/utils/undo-controller-exclusions.ts'),
      readText('specs/004-add-undo-functionality/spec.md'),
      readText('specs/004-add-undo-functionality/contracts/undo-workflow-integration.md'),
      readText('specs/004-add-undo-functionality/tasks.md'),
    ]);

    expect(exclusions).toContain('UNDO_RECORDING_EXCLUDED_CONTROLLERS');
    for (const source of [spec, workflowContract, tasks]) {
      expect(source).toContain('universal');
      expect(source).toContain('undo-controller-exclusions');
    }
    expect(tasks).toContain('undo-controller-coverage.test.ts');
  });

  it('keeps component filenames PascalCase, helper modules kebab-case, and tsx files on one primary export', async () => {
    const files = await walk('src/app');

    for (const filePath of files) {
      const relativePath = path.relative(appRoot, filePath).replace(/\\/g, '/');
      const fileName = path.basename(filePath);
      const source = await readFile(filePath, 'utf8');

      if (filePath.endsWith('.tsx')) {
        expect(/^[A-Z][A-Za-z0-9]*\.tsx$/.test(fileName), relativePath).toBe(true);
        const componentExports = [
          ...source.matchAll(/export\s+(?:function|const|class)\s+([A-Z][A-Za-z0-9]*)/g),
        ];
        expect(componentExports).toHaveLength(1);
      } else {
        expect(/^[a-z0-9]+(?:-[a-z0-9]+)*\.ts$/.test(fileName), relativePath).toBe(true);
      }
    }
  });
});
