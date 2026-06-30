import { describe, expect, it } from 'vitest';
import { ThemeUiStore } from './theme-ui-store';
import type { Theme } from '../../../model/schema/theme-schemas';

const baseTheme: Theme = {
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

describe('ThemeUiStore scopeThemeInputsGeneration', () => {
  it('does not bump when only the theme name changes', () => {
    const store = new ThemeUiStore();
    store.getStore().setTheme(baseTheme);
    const generationBefore = store.getStore().state.scopeThemeInputsGeneration;

    store.getStore().setTheme({ ...baseTheme, name: 'renamed-theme' });

    expect(store.getStore().state.scopeThemeInputsGeneration).toBe(generationBefore);
  });

  it('bumps when preview color assignments change', () => {
    const store = new ThemeUiStore();
    store.getStore().setTheme(baseTheme);
    const generationBefore = store.getStore().state.scopeThemeInputsGeneration;

    store.getStore().setTheme({
      ...baseTheme,
      colorAssignments: [
        {
          colorRef: 'editorForeground',
          dark: { value: '#AABBCC' },
          light: { value: '#445566' },
          useDarkForLight: false,
        },
      ],
    });

    expect(store.getStore().state.scopeThemeInputsGeneration).toBeGreaterThan(generationBefore);
  });

  it('does not bump during deferred hue drag', () => {
    const store = new ThemeUiStore();
    store.getStore().setTheme(baseTheme);
    const generationBefore = store.getStore().state.scopeThemeInputsGeneration;

    store.getStore().setHueAdjustment(15, { deferPreview: true });

    expect(store.getStore().state.scopeThemeInputsGeneration).toBe(generationBefore);
  });
});
