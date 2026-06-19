import { beforeAll, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { container } from 'tsyringe';
import { ThemePreviewStore } from '../../../domain/state/ui/theme-preview-store';
import { ThemeUiStore } from '../../../domain/state/ui/theme-ui-store';
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

vi.mock('../../core/action-queue/use-app-dispatch', () => ({
  useAppDispatch: () => vi.fn(),
}));

const themeUiStore = new ThemeUiStore();
const themePreviewStore = new ThemePreviewStore();
const originalResolve = container.resolve.bind(container);

describe('useEditorPreviewsCardViewModel', () => {
  let useEditorPreviewsCardViewModel: typeof import('./use-editor-previews-card-viewmodel').useEditorPreviewsCardViewModel;

  beforeAll(async () => {
    vi.spyOn(container, 'resolve').mockImplementation((token: unknown) => {
      if (token === ThemeUiStore) return themeUiStore;
      if (token === ThemePreviewStore) return themePreviewStore;
      return originalResolve(token as never);
    });
    ({ useEditorPreviewsCardViewModel } = await import('./use-editor-previews-card-viewmodel'));
  });

  it('does not rerender preview slice outputs when only the theme name changes', async () => {
    themeUiStore.getStore().setTheme(baseTheme);

    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useEditorPreviewsCardViewModel();
    });

    await waitFor(() => {
      expect(result.current.theme?.templateRef?.name).toBe('template-a');
    });

    const contrastAssignmentsBefore = result.current.contrastAssignments;
    const themeBackgroundTokenRefBefore = result.current.themeBackgroundTokenRef;
    const renderCountBefore = renderCount;

    themeUiStore.getStore().setTheme({ ...baseTheme, name: 'renamed-theme' });

    await waitFor(() => {
      expect(themeUiStore.getStore().state.theme?.name).toBe('renamed-theme');
    });

    expect(renderCount).toBe(renderCountBefore);
    expect(result.current.contrastAssignments).toBe(contrastAssignmentsBefore);
    expect(result.current.themeBackgroundTokenRef).toBe(themeBackgroundTokenRefBefore);
  });
});
