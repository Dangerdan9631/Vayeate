import { describe, expect, it, vi } from 'vitest';
import { SetThemeTemplateController } from '../app/theme/theme-details-card/controllers/set-theme-template-controller';
import { ValidateCanLockCatalog } from './catalog/validations/validate-can-lock-catalog';
import { ValidateCanBulkAddTokens } from './catalog/validations/validate-can-bulk-add-tokens';
import { compareVersions } from './utils/compare-versions';
import { findNearestVersionRef } from './utils/find-nearest-version-ref';
import { generateThemePair } from './utils/theme-generator';
import { isMappingOrphanForTemplate } from './utils/is-mapping-orphan-for-template';
import { assertValidThemeFileName } from './utils/assert-valid-theme-file-name';
import { toSafeFileName } from './utils/to-safe-theme-file-name';
import { ValidateCanLockTemplate } from './validations/template-validations/validate-can-lock-template';
import { ApplyThemeStateAndSchedulePersistOperation } from './operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeLoadedTemplateOperation } from './operations/theme-operations/theme-details/set-theme-loaded-template-operation';
import { ThemeUiStore } from './state/ui/theme-ui-store';
import { ThemePreviewStore } from './state/ui/theme-preview-store';
import type { Catalog } from '../model/schema/catalog';
import type { Template } from '../model/schema/template-schemas';
import type { Theme } from '../model/schema/theme-schemas';

const manualCatalog: Catalog = {
  name: 'catalog-a',
  version: '1.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [
    { key: 'editor.foreground', type: 'theme' },
    { key: 'keyword.control', type: 'textmate token' },
    { key: '*.deprecated', type: 'semantic token' },
  ],
  semanticTokenTypes: ['variable'],
  semanticTokenModifiers: ['deprecated'],
  semanticTokenLanguages: ['typescript'],
};

const template: Template = {
  name: 'template-a',
  version: '1.0.0',
  locked: false,
  catalogRefs: [{ name: 'catalog-a', version: '1.0.0' }],
  mappings: [
    {
      token: { key: 'editor.foreground', type: 'theme' },
      colorVariableRef: 'editorForeground',
      contrastVariableRef: null,
      groupRef: null,
    },
    {
      token: { key: 'keyword.control', type: 'textmate token' },
      colorVariableRef: 'editorForeground',
      contrastVariableRef: null,
      groupRef: null,
    },
    {
      token: { key: '*.deprecated', type: 'semantic token' },
      colorVariableRef: null,
      contrastVariableRef: null,
      groupRef: null,
    },
  ],
  colorVariables: [{ key: 'editorForeground', groupRef: null }],
  contrastVariables: [],
  groups: [],
  semanticTokenModifiers: ['deprecated'],
  semanticTokenLanguages: ['typescript'],
};

const theme: Theme = {
  name: 'baseline',
  version: '1.0.0',
  templateRef: { name: 'template-a', version: '1.0.0' },
  idePrimaryTokenRef: null,
  ideForegroundTokenRef: null,
  themeBackgroundTokenRef: null,
  themeForegroundTokenRef: null,
  lineNumberBackgroundTokenRef: null,
  lineNumberForegroundTokenRef: null,
  ideTabTokenRef: null,
  ideTabBarBackgroundTokenRef: null,
  ideTabBarForegroundTokenRef: null,
  editorPreviewScrollbarBackgroundTokenRef: null,
  editorPreviewScrollbarForegroundTokenRef: null,
  editorPreviewSelectionBackgroundTokenRef: null,
  editorPreviewMenuForegroundTokenRef: null,
  editorPreviewMenuBackgroundTokenRef: null,
  colorAssignments: [
    {
      colorRef: 'editorForeground',
      dark: { value: '#112233' },
      light: { value: '#445566' },
      useDarkForLight: false,
    },
  ],
  contrastAssignments: [],
  applyPaletteToDark: true,
  applyPaletteToLight: true,
  paletteClusterCountK: 5,
  paletteClusterGroupIds: [],
};

describe('baseline domain policy', () => {
  it('supports catalog and template lock validations', () => {
    const canLockCatalog = new ValidateCanLockCatalog();
    const canBulkAddTokens = new ValidateCanBulkAddTokens();
    const canLockTemplate = new ValidateCanLockTemplate();

    expect(canLockCatalog.test(manualCatalog)).toBe(true);
    expect(canLockCatalog.test({ ...manualCatalog, locked: true })).toBe(false);
    expect(canLockCatalog.test({ ...manualCatalog, type: 'remote' })).toBe(false);

    expect(canBulkAddTokens.test(manualCatalog, '  editor.foreground  ')).toBe(true);
    expect(canBulkAddTokens.test(manualCatalog, '   ')).toBe(false);

    expect(canLockTemplate.test(template)).toBe(true);
    expect(canLockTemplate.test({ ...template, locked: true })).toBe(false);
  });

  it('compares semantic versions and finds the nearest remaining version', () => {
    expect(compareVersions('1.0.0', '1.0.1')).toBeLessThan(0);
    expect(compareVersions('2.0.0', '1.9.9')).toBeGreaterThan(0);
    expect(compareVersions('1.2.3', '1.2.3')).toBe(0);

    const refs = [
      { name: 'catalog-a', version: '1.0.0' },
      { name: 'catalog-a', version: '1.0.2' },
      { name: 'catalog-a', version: '1.1.0' },
      { name: 'catalog-b', version: '1.0.0' },
    ];

    expect(findNearestVersionRef(refs, 'catalog-a', '1.0.1')).toEqual({
      name: 'catalog-a',
      version: '1.0.0',
    });
    expect(findNearestVersionRef(refs, 'catalog-a', '1.1.0')).toEqual({
      name: 'catalog-a',
      version: '1.0.2',
    });
    expect(findNearestVersionRef([{ name: 'catalog-a', version: '1.0.0' }], 'catalog-a', '1.0.0')).toBeNull();
  });

  it('detects orphan mappings only when the referenced catalog snapshots are present', () => {
    const orphanTemplate: Template = {
      ...template,
      mappings: [
        ...template.mappings,
        {
          token: { key: 'missing.token', type: 'theme' },
          colorVariableRef: 'editorForeground',
          contrastVariableRef: null,
          groupRef: null,
        },
      ],
    };

    expect(
      isMappingOrphanForTemplate(template, 'editor.foreground', 'theme', [manualCatalog]),
    ).toBe(false);

    expect(
      isMappingOrphanForTemplate(orphanTemplate, 'missing.token', 'theme', [manualCatalog]),
    ).toBe(true);

    expect(
      isMappingOrphanForTemplate(orphanTemplate, 'missing.token', 'theme', []),
    ).toBe(false);
  });

  it('generates dark and light theme exports from template mappings', () => {
    const generated = generateThemePair(theme, template);

    expect(generated.dark.name).toBe('Baseline');
    expect(generated.light.name).toBe('Baseline Light');
    expect(generated.dark.colors).toEqual({ 'editor.foreground': '#112233' });
    expect(generated.light.colors).toEqual({ 'editor.foreground': '#445566' });
    expect(generated.dark.tokenColors).toEqual([
      {
        name: 'editorForeground',
        scope: ['keyword.control'],
        settings: { foreground: '#112233' },
      },
    ]);
    expect(generated.dark.semanticTokenColors['*.deprecated']).toEqual({
      strikethrough: true,
    });
  });

  it('keeps generated theme file names safe for export', () => {
    expect(toSafeFileName('Baseline Theme!', false)).toBe('baselinetheme-color-theme.json');
    expect(toSafeFileName('Baseline Theme!', true)).toBe('baselinetheme-light-color-theme.json');

    expect(() => assertValidThemeFileName('baseline-color-theme.json')).not.toThrow();
    expect(() => assertValidThemeFileName('Baseline.json')).toThrow();
  });

  it('applies a loaded template through theme policy seams and leaves state unchanged when no snapshot loads', async () => {
    const themeUiStore = new ThemeUiStore();
    const themePreviewStore = new ThemePreviewStore();
    themeUiStore.getStore().setTheme(theme);
    themeUiStore.getStore().setSaveError('stale error');

    const scheduled: Array<{ run: () => Promise<void>; fail: (message: string) => void }> = [];
    const debouncedThemePersist = {
      schedule: vi.fn((run: () => Promise<void>, fail: (message: string) => void) => {
        scheduled.push({ run, fail });
      }),
    };
    const themeGateway = { saveTheme: vi.fn(async () => {}) };
    const applyThemeStateAndSchedulePersist = new ApplyThemeStateAndSchedulePersistOperation(
      themeUiStore,
      debouncedThemePersist as never,
      themeGateway as never,
    );
    const setThemeLoadedTemplate = new SetThemeLoadedTemplateOperation(themePreviewStore);
    const loadTemplateSnapshot: { execute: ReturnType<typeof vi.fn> } = {
      execute: vi.fn(async () => ({
        name: 'template-b',
        version: '2.0.0',
        locked: false,
        catalogRefs: [],
        mappings: [
          {
            token: { key: 'editor.foreground', type: 'theme' as const },
            colorVariableRef: 'editorForeground',
            contrastVariableRef: null,
            groupRef: null,
          },
        ],
        colorVariables: [{ key: 'editorForeground', groupRef: null }],
        contrastVariables: [],
        groups: [],
        semanticTokenModifiers: [],
        semanticTokenLanguages: [],
      })),
    };
    const controller = new SetThemeTemplateController(
      themeUiStore,
      applyThemeStateAndSchedulePersist,
      loadTemplateSnapshot as never,
      setThemeLoadedTemplate,
    );

    await controller.run('template-b', '2.0.0');

    expect(loadTemplateSnapshot.execute).toHaveBeenCalledWith('template-b', '2.0.0');
    expect(themeUiStore.getStore().state.theme).toEqual(
      expect.objectContaining({
        templateRef: { name: 'template-b', version: '2.0.0' },
        colorAssignments: [
          expect.objectContaining({
            colorRef: 'editorForeground',
            dark: { value: '#112233' },
            light: { value: '#445566' },
          }),
        ],
      }),
    );
    expect(themeUiStore.getStore().state.saveError).toBeNull();
    expect(themePreviewStore.getStore().state.loadedTemplateForTheme).toEqual(
      expect.objectContaining({ name: 'template-b', version: '2.0.0' }),
    );
    expect(debouncedThemePersist.schedule).toHaveBeenCalledTimes(1);

    loadTemplateSnapshot.execute = vi.fn(async () => null);
    const unchangedTheme = themeUiStore.getStore().state.theme;

    await controller.run('missing-template', '9.9.9');

    expect(themeUiStore.getStore().state.theme).toBe(unchangedTheme);
    expect(debouncedThemePersist.schedule).toHaveBeenCalledTimes(1);
  });

  it('leaves theme state unchanged when no theme is selected before template replacement', async () => {
    const themeUiStore = new ThemeUiStore();
    const themePreviewStore = new ThemePreviewStore();
    const debouncedThemePersist = { schedule: vi.fn() };
    const themeGateway = { saveTheme: vi.fn(async () => {}) };
    const applyThemeStateAndSchedulePersist = new ApplyThemeStateAndSchedulePersistOperation(
      themeUiStore,
      debouncedThemePersist as never,
      themeGateway as never,
    );
    const setThemeLoadedTemplate = new SetThemeLoadedTemplateOperation(themePreviewStore);
    const loadTemplateSnapshot = { execute: vi.fn(async () => template) };
    const controller = new SetThemeTemplateController(
      themeUiStore,
      applyThemeStateAndSchedulePersist,
      loadTemplateSnapshot as never,
      setThemeLoadedTemplate,
    );

    await controller.run('template-a', '1.0.0');

    expect(loadTemplateSnapshot.execute).not.toHaveBeenCalled();
    expect(themeUiStore.getStore().state.theme).toBeNull();
    expect(themePreviewStore.getStore().state.loadedTemplateForTheme).toBeNull();
    expect(debouncedThemePersist.schedule).not.toHaveBeenCalled();
  });
});
