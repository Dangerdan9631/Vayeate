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
  'src/app/common/eyedropper-overlay/use-eyedropper-overlay-viewmodel.ts',
  'src/app/common/styled-tooltip/use-styled-tooltip-viewmodel.ts',
  'src/app/app/app-shell/use-app-shell-viewmodel.ts',
  'src/app/app/menu-bar/use-menubar-viewmodel.ts',
  'src/app/app/ribbon/use-ribbon-viewmodel.ts',
  'src/app/app/status-bar/use-status-bar-viewmodel.ts',
  'src/app/catalog/bulk-add-dialog/use-bulk-add-dialog-viewmodel.ts',
  'src/app/catalog/catalog-details-card/use-catalog-details-card-viewmodel.ts',
  'src/app/catalog/catalog-page/use-catalog-viewmodel.ts',
  'src/app/catalog/catalogs-card/use-catalogs-card-viewmodel.ts',
  'src/app/catalog/create-dialog/use-create-catalog-dialog-viewmodel.ts',
  'src/app/catalog/tokens-card/use-tokens-card-viewmodel.ts',
  'src/app/template/create-template-dialog/use-create-template-dialog-viewmodel.ts',
  'src/app/template/groups-card/use-groups-card-viewmodel.ts',
  'src/app/template/mappings-card/use-mappings-card-viewmodel.ts',
  'src/app/template/template-catalogs-card/use-template-catalogs-card-viewmodel.ts',
  'src/app/template/template-details-card/use-template-details-card-viewmodel.ts',
  'src/app/template/template-page/use-template-viewmodel.ts',
  'src/app/template/templates-card/use-templates-card-viewmodel.ts',
  'src/app/template/variables-card/use-variables-card-viewmodel.ts',
  'src/app/theme/create-theme-dialog/use-create-theme-dialog-viewmodel.ts',
  'src/app/theme/editor-previews-card/use-editor-previews-card-viewmodel.ts',
  'src/app/theme/theme-details-card/use-theme-details-card-viewmodel.ts',
  'src/app/theme/theme-page/use-theme-viewmodel.ts',
  'src/app/theme/theme-palette-card/use-theme-palette-card-viewmodel.ts',
  'src/app/theme/theme-variables-card/use-theme-variables-card-viewmodel.ts',
  'src/app/theme/themes-card/use-themes-card-viewmodel.ts',
];

const actionTypeFiles = [
  'src/app/common/eyedropper-overlay/actions/eyedropper-overlay-action-type.ts',
  'src/app/common/styled-tooltip/actions/styled-tooltip-action-type.ts',
  'src/app/app/app-shell/actions/app-shell-action-type.ts',
  'src/app/app/menu-bar/actions/app-menu-action-type.ts',
  'src/app/app/ribbon/actions/app-ribbon-action-type.ts',
  'src/app/catalog/actions/catalog-action-type.ts',
  'src/app/template/actions/template-action-type.ts',
  'src/app/theme/actions/theme-action-type.ts',
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
      readText('src/domain/core/undo-stack-types.ts'),
      readText('src/domain/core/undo-processor.ts'),
      readText('src/domain/core/undo-stack.ts'),
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
      readText('src/domain/state/undo-stack/undo-stack-state.ts'),
      readText('src/model/undo-history.ts'),
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
      readText('src/app/catalog/tokens-card/controllers/update-token-key-controller.ts'),
      readText('src/app/template/variables-card/controllers/add-variable-controller.ts'),
      readText('src/app/template/groups-card/controllers/add-group-and-clear-input-controller.ts'),
      readText('src/app/theme/theme-palette-card/controllers/assign-color-from-picker-controller.ts'),
      readText('src/app/theme/theme-palette-card/controllers/record-palette-color-assign-undo.ts'),
      readText('src/app/theme/theme-variables-card/controllers/set-color-variable-dark-controller.ts'),
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
      readText('test/architecture/undo-controller-exclusions.ts'),
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
