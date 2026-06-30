import { describe, expect, it, vi } from 'vitest';
import type { Theme } from '../../../model/schema/theme-schemas';
import * as deriveThemePaneFieldsModule from '../../utils/derive-theme-pane-fields';
import { ThemeUiStore } from './theme-ui-store';

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

describe('ThemeUiStore', () => {
  it('does not recompute pane display fields on search-only writes', () => {
    const store = new ThemeUiStore();
    store.getStore().setTheme(theme);
    const paneDisplayBefore = store.getStore().state.paneDisplayColorAssignments;
    const paneSelectedBefore = store.getStore().state.paneSelectedColorsDisplay;
    const deriveSpy = vi.spyOn(deriveThemePaneFieldsModule, 'deriveThemePaneFields');

    store.getStore().setThemeVariablesSearchText('editor');
    store.getStore().setThemeVariablesSearchText('editor fg');

    expect(store.getStore().state.themeVariablesSearchText).toBe('editor fg');
    expect(store.getStore().state.paneDisplayColorAssignments).toBe(paneDisplayBefore);
    expect(store.getStore().state.paneSelectedColorsDisplay).toBe(paneSelectedBefore);
    expect(deriveSpy).not.toHaveBeenCalled();

    deriveSpy.mockRestore();
  });

  it('recomputes pane display fields when derivation inputs change', () => {
    const store = new ThemeUiStore();
    store.getStore().setTheme(theme);
    const paneDisplayBefore = store.getStore().state.paneDisplayColorAssignments;

    store.getStore().setHueAdjustment(25);

    expect(store.getStore().state.hueAdjustment).toBe(25);
    expect(store.getStore().state.paneDisplayColorAssignments).not.toBe(paneDisplayBefore);
  });

  it('does not recompute pane display fields on cluster-count preview writes', () => {
    const store = new ThemeUiStore();
    store.getStore().setTheme(theme);
    const paneDisplayBefore = store.getStore().state.paneDisplayColorAssignments;
    const paneSelectedBefore = store.getStore().state.paneSelectedColorsDisplay;
    const deriveSpy = vi.spyOn(deriveThemePaneFieldsModule, 'deriveThemePaneFields');

    store.getStore().setPreviewClusterCountK(8);
    store.getStore().setPreviewClusterCountK(10);

    expect(store.getStore().state.previewClusterCountK).toBe(10);
    expect(store.getStore().state.theme?.paletteClusterCountK).toBe(5);
    expect(store.getStore().state.paneDisplayColorAssignments).toBe(paneDisplayBefore);
    expect(store.getStore().state.paneSelectedColorsDisplay).toBe(paneSelectedBefore);
    expect(deriveSpy).not.toHaveBeenCalled();

    deriveSpy.mockRestore();
  });

  it('clears cluster-count preview when theme is set', () => {
    const store = new ThemeUiStore();
    store.getStore().setTheme(theme);
    store.getStore().setPreviewClusterCountK(9);

    store.getStore().setTheme({ ...theme, paletteClusterCountK: 7 });

    expect(store.getStore().state.previewClusterCountK).toBeNull();
    expect(store.getStore().state.theme?.paletteClusterCountK).toBe(7);
  });

  it('keeps preview assignments stable during deferred hue drag deltas', () => {
    const store = new ThemeUiStore();
    store.getStore().setTheme(theme);
    store.getStore().setThemePaneSelections(['editorForeground'], []);
    const previewBefore = store.getStore().state.panePreviewColorAssignments;
    const displayBefore = store.getStore().state.paneDisplayColorAssignments;

    store.getStore().setHueAdjustment(25, { deferPreview: true });

    expect(store.getStore().state.hueAdjustment).toBe(25);
    expect(store.getStore().state.panePreviewColorAssignments).toBe(previewBefore);
    expect(store.getStore().state.paneDisplayColorAssignments).not.toBe(displayBefore);
  });

  it('syncs preview assignments when hue drag is committed', () => {
    const store = new ThemeUiStore();
    store.getStore().setTheme(theme);
    store.getStore().setThemePaneSelections(['editorForeground'], []);
    store.getStore().setHueAdjustment(25, { deferPreview: true });
    const previewBefore = store.getStore().state.panePreviewColorAssignments;

    store.getStore().setHueAdjustment(25, { deferPreview: false });

    expect(store.getStore().state.panePreviewColorAssignments).not.toBe(previewBefore);
    expect(store.getStore().state.panePreviewColorAssignments).toEqual(
      store.getStore().state.paneDisplayColorAssignments,
    );
  });

  it('keeps preview assignments stable during deferred saturation and value drag deltas', () => {
    const store = new ThemeUiStore();
    store.getStore().setTheme(theme);
    store.getStore().setThemePaneSelections(['editorForeground'], []);
    const previewBefore = store.getStore().state.panePreviewColorAssignments;
    const displayBefore = store.getStore().state.paneDisplayColorAssignments;

    store.getStore().setSaturationAdjustment(25, { deferPreview: true });
    store.getStore().setValueAdjustment(-15, { deferPreview: true });

    expect(store.getStore().state.saturationAdjustment).toBe(25);
    expect(store.getStore().state.valueAdjustment).toBe(-15);
    expect(store.getStore().state.panePreviewColorAssignments).toBe(previewBefore);
    expect(store.getStore().state.paneDisplayColorAssignments).not.toBe(displayBefore);
  });

  it('syncs preview assignments when saturation and value drags are committed', () => {
    const store = new ThemeUiStore();
    store.getStore().setTheme(theme);
    store.getStore().setThemePaneSelections(['editorForeground'], []);
    store.getStore().setSaturationAdjustment(25, { deferPreview: true });
    store.getStore().setValueAdjustment(-15, { deferPreview: true });
    const previewBefore = store.getStore().state.panePreviewColorAssignments;

    store.getStore().setSaturationAdjustment(25, { deferPreview: false });
    store.getStore().setValueAdjustment(-15, { deferPreview: false });

    expect(store.getStore().state.panePreviewColorAssignments).not.toBe(previewBefore);
    expect(store.getStore().state.panePreviewColorAssignments).toEqual(
      store.getStore().state.paneDisplayColorAssignments,
    );
  });
});
