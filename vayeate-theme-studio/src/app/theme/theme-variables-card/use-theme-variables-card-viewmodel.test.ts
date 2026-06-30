import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { container } from 'tsyringe';
import { ThemePreviewStore } from '../../../domain/state/ui/theme-preview-store';
import { ThemeUiStore } from '../../../domain/state/ui/theme-ui-store';
import { ThemeVariablesCardActionType } from './actions/theme-variables-card-action-type';
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
    {
      colorRef: 'editorBackground',
      dark: { value: '#000000' },
      light: { value: '#ffffff' },
      useDarkForLight: false,
    },
  ],
  contrastAssignments: [
    {
      contrastVariableRef: 'contrastA',
      dark: { value: 4.5, comparisonMethod: 'greaterThan', min: null, max: null },
      light: { value: 4.5, comparisonMethod: 'greaterThan', min: null, max: null },
      useDarkForLight: true,
    },
  ],
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

describe('useThemeVariablesCardViewModel', () => {
  let useThemeVariablesCardViewModel: typeof import('./use-theme-variables-card-viewmodel').useThemeVariablesCardViewModel;

  beforeAll(async () => {
    vi.spyOn(container, 'resolve').mockImplementation((token: unknown) => {
      if (token === ThemeUiStore) return themeUiStore;
      if (token === ThemePreviewStore) return themePreviewStore;
      return originalResolve(token as never);
    });
    ({ useThemeVariablesCardViewModel } = await import('./use-theme-variables-card-viewmodel'));
  });

  beforeEach(() => {
    dispatch.mockClear();
    themeUiStore.getStore().setTheme(baseTheme);
    themeUiStore.getStore().setThemePaneSelections([], []);
  });

  it('keeps toggle callback identity when pane selections change', async () => {
    const { result } = renderHook(() => useThemeVariablesCardViewModel());

    await waitFor(() => {
      expect(result.current.colorAssignments).toHaveLength(2);
    });

    const toggleColorBefore = result.current.onToggleColorChecked;
    const toggleContrastBefore = result.current.onToggleContrastChecked;

    themeUiStore.getStore().setThemePaneSelections(['editorForeground'], ['contrastA']);

    await waitFor(() => {
      expect(result.current.checkedColorRefs.has('editorForeground')).toBe(true);
    });

    expect(result.current.onToggleColorChecked).toBe(toggleColorBefore);
    expect(result.current.onToggleContrastChecked).toBe(toggleContrastBefore);
  });

  it('reads current selection from the store when toggling', async () => {
    const { result } = renderHook(() => useThemeVariablesCardViewModel());

    await waitFor(() => {
      expect(result.current.colorAssignments).toHaveLength(2);
    });

    themeUiStore.getStore().setThemePaneSelections(['editorForeground'], []);

    result.current.onToggleColorChecked('editorForeground');
    expect(dispatch).toHaveBeenCalledWith({
      type: ThemeVariablesCardActionType.VariableSelectionCheckboxOnToggle,
      ref: 'editorForeground',
      checked: false,
    });

    dispatch.mockClear();

    result.current.onToggleColorChecked('editorBackground');
    expect(dispatch).toHaveBeenCalledWith({
      type: ThemeVariablesCardActionType.VariableSelectionCheckboxOnToggle,
      ref: 'editorBackground',
      checked: true,
    });
  });
});
