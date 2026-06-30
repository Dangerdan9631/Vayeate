import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { container } from 'tsyringe';
import { ThemePreviewStore } from '../../../domain/state/ui/theme-preview-store';
import { ThemeUiStore } from '../../../domain/state/ui/theme-ui-store';
import type { Theme } from '../../../model/schema/theme-schemas';
import { ThemePaletteCardActionType } from './actions/theme-palette-card-action-type';

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

const dispatch = vi.fn();

vi.mock('../../core/action-queue/use-app-dispatch', () => ({
  useAppDispatch: () => dispatch,
}));

const themeUiStore = new ThemeUiStore();
const themePreviewStore = new ThemePreviewStore();
const originalResolve = container.resolve.bind(container);

describe('useThemePaletteCardViewModel', () => {
  let useThemePaletteCardViewModel: typeof import('./use-theme-palette-card-viewmodel').useThemePaletteCardViewModel;

  beforeAll(async () => {
    vi.spyOn(container, 'resolve').mockImplementation((token: unknown) => {
      if (token === ThemeUiStore) return themeUiStore;
      if (token === ThemePreviewStore) return themePreviewStore;
      return originalResolve(token as never);
    });
    ({ useThemePaletteCardViewModel } = await import('./use-theme-palette-card-viewmodel'));
  });

  beforeEach(() => {
    dispatch.mockClear();
    themeUiStore.getStore().setTheme(baseTheme);
    themeUiStore.getStore().setSelectedRef({ name: 'baseline', version: '1.0.0' });
    themeUiStore.getStore().setThemePaneSelections([], []);
  });

  it('commits active palette adjustments when color selection changes', async () => {
    themeUiStore.getStore().setHueAdjustment(20, { deferPreview: true });
    themeUiStore.getStore().setSaturationAdjustment(15, { deferPreview: true });
    themeUiStore.getStore().setValueAdjustment(-10, { deferPreview: true });
    const { result } = renderHook(() => useThemePaletteCardViewModel());

    await waitFor(() => {
      expect(result.current.hueAdjustment).toBe(20);
    });
    dispatch.mockClear();

    themeUiStore.getStore().setThemePaneSelections(['editorForeground'], []);

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: ThemePaletteCardActionType.HueSliderOnCommit,
        value: 20,
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: ThemePaletteCardActionType.SaturationSliderOnCommit,
        value: 15,
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: ThemePaletteCardActionType.ValueSliderOnCommit,
        value: -10,
      });
    });
  });
});
