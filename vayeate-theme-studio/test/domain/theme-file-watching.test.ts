import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { SetThemeFileWatchingOperation } from '../../src/domain/operations/Theme/theme-operations/theme-details/set-theme-file-watching-operation';
import type { EnqueueBackgroundQueueActionOperation } from '../../src/domain/operations/Queue/background-queue/enqueue-background-queue-action-operation';
import { ThemesStore } from '../../src/domain/state/Theme/data/themes-store';
import { ThemePreviewStore } from '../../src/domain/state/Theme/ui/theme-preview-store';
import { ThemeUiStore } from '../../src/domain/state/Theme/ui/theme-ui-store';
import { ValidateAreScopeThemeGenerationInputsEqual } from '../../src/domain/validations/Theme/theme-validations/validate-are-scope-theme-generation-inputs-equal';
import { ValidateAreThemePaneDerivationInputsEqual } from '../../src/domain/validations/Theme/theme-validations/validate-are-theme-pane-derivation-inputs-equal';
import type { TemplateGateway } from '../../src/gateway/gateway/Template/template/template-gateway';
import type { DebouncedThemePersistGateway } from '../../src/gateway/gateway/Theme/theme/debounced-theme-persist-gateway';
import type { ThemeGateway } from '../../src/gateway/gateway/Theme/theme/theme-gateway';
import type { Template } from '../../src/model/Template/schema/template-schemas';
import type { Theme } from '../../src/model/Theme/schema/theme-schemas';

function buildTheme(dark: string): Theme {
  return {
    name: 'demo',
    version: '1.0.0',
    templateRef: { name: 'base', version: '1.0.0' },
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
    colorAssignments: [{
      colorRef: 'foreground',
      light: { value: '#EEEEEE' },
      dark: { value: dark },
      useDarkForLight: false,
    }],
    contrastAssignments: [],
    styleAssignments: [],
    applyPaletteToDark: true,
    applyPaletteToLight: true,
    paletteClusterCountK: 5,
    paletteClusterGroupIds: [],
  };
}

const template: Template = {
  name: 'base',
  version: '1.0.0',
  locked: false,
  catalogRefs: [],
  mappings: [],
  colorVariables: [{ key: 'foreground', groupRef: null }],
  contrastVariables: [],
  styleVariables: [],
  groups: [],
  semanticTokenModifiers: [],
  semanticTokenLanguages: [],
};

describe('SetThemeFileWatchingOperation', () => {
  it('applies external selected-theme changes and releases the watcher on page unload', async () => {
    const themesStore = new ThemesStore();
    const themeUiStore = new ThemeUiStore(
      new ValidateAreThemePaneDerivationInputsEqual(),
      new ValidateAreScopeThemeGenerationInputsEqual(),
    );
    const themePreviewStore = new ThemePreviewStore();
    const externalTheme = buildTheme('#222222');
    const stopWatch = vi.fn().mockResolvedValue(undefined);
    let notifyExternalChange: (() => void) | undefined;
    let queuedReload: (() => Promise<void>) | undefined;
    const watchTheme = vi.fn(
      async (_name: string, _version: string, onChange: () => void) => {
        notifyExternalChange = onChange;
        return stopWatch;
      },
    );
    const loadTheme = vi.fn().mockResolvedValue(externalTheme);
    const loadTemplate = vi.fn().mockResolvedValue(template);
    const cancel = vi.fn();
    const schedulePreviewRefresh = vi.fn();
    const enqueue = vi.fn(
      (
        _queue: string,
        _description: string,
        run: () => Promise<void>,
      ) => {
        queuedReload = run;
      },
    );
    const operation = new SetThemeFileWatchingOperation(
      themesStore,
      themeUiStore,
      themePreviewStore,
      { watchTheme, loadTheme } as unknown as ThemeGateway,
      { loadTemplate } as unknown as TemplateGateway,
      { cancel, schedulePreviewRefresh } as unknown as DebouncedThemePersistGateway,
      { execute: enqueue } as unknown as EnqueueBackgroundQueueActionOperation,
    );

    themeUiStore.getStore().setSelectedRef({ name: 'demo', version: '1.0.0' });
    operation.execute(true);
    await Promise.resolve();

    expect(watchTheme).toHaveBeenCalledWith('demo', '1.0.0', expect.any(Function));
    notifyExternalChange?.();
    expect(cancel).toHaveBeenCalledOnce();
    expect(enqueue).toHaveBeenCalledWith(
      'data_io',
      'Reloading externally changed theme demo 1.0.0',
      expect.any(Function),
      { key: 'data/themes/demo-1.0.0.theme.json', access: 'read' },
    );

    await queuedReload?.();

    expect(themeUiStore.getStore().state.theme?.colorAssignments[0]?.dark?.value).toBe('#222222');
    expect(
      themesStore.getStore().state.themeMap.demo?.['1.0.0']?.theme,
    ).toEqual(themeUiStore.getStore().state.theme);
    expect(themePreviewStore.getStore().state.loadedTemplateForTheme).toEqual(template);
    expect(schedulePreviewRefresh).toHaveBeenCalledWith(themeUiStore.getStore().state.theme);

    operation.execute(false);
    await Promise.resolve();
    expect(stopWatch).toHaveBeenCalledOnce();
  });
});
