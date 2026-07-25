import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { CommitPendingPaletteAdjustmentOperation } from '../../src/domain/operations/Theme/theme-operations/theme-pane-selection/commit-pending-palette-adjustment-operation';
import type { ThemesStore } from '../../src/domain/state/Theme/data/themes-store';
import type { ThemeUiStore } from '../../src/domain/state/Theme/ui/theme-ui-store';
import type { Theme } from '../../src/model/Theme/schema/theme-schemas';
import type { DebouncedThemePersistGateway } from '../../src/gateway/gateway/Theme/theme/debounced-theme-persist-gateway';

function buildTheme(): Theme {
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
      colorRef: 'fg',
      dark: { value: '#ff0000' },
      light: { value: '#00ff00' },
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

describe('CommitPendingPaletteAdjustmentOperation', () => {
  it('applies a committed adjustment to the theme and schedules its save', () => {
    const theme = buildTheme();
    const setTheme = vi.fn();
    const updateTheme = vi.fn();
    const schedule = vi.fn();
    const store = {
      state: {
        theme,
        selectedRef: { name: theme.name, version: theme.version },
        hueAdjustment: 10,
        saturationAdjustment: 0,
        valueAdjustment: 0,
        checkedColorRefs: ['fg'],
      },
      setTheme,
      setThemeLoadState: vi.fn(),
      setSaveError: vi.fn(),
      setHueAdjustment: vi.fn(),
      setSaturationAdjustment: vi.fn(),
      setValueAdjustment: vi.fn(),
    };
    const operation = new CommitPendingPaletteAdjustmentOperation(
      { getStore: () => store } as unknown as ThemeUiStore,
      { getStore: () => ({ updateTheme }) } as unknown as ThemesStore,
      { schedule } as unknown as DebouncedThemePersistGateway,
    );

    const result = operation.execute();

    expect(result?.afterTheme).not.toEqual(theme);
    expect(result?.afterTheme.colorAssignments).not.toEqual(theme.colorAssignments);
    expect(setTheme).toHaveBeenCalledWith(result?.afterTheme, true);
    expect(updateTheme).toHaveBeenCalledWith(result?.afterTheme);
    expect(schedule).toHaveBeenCalledWith(result?.afterTheme, expect.any(Function));
    expect(store.setHueAdjustment).toHaveBeenCalledWith(0);
    expect(store.setSaturationAdjustment).toHaveBeenCalledWith(0);
    expect(store.setValueAdjustment).toHaveBeenCalledWith(0);
  });
});
