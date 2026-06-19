import { describe, expect, it } from 'vitest';
import type { Theme } from '../../model/schema/theme-schemas';
import { deriveThemePaneFields } from './derive-theme-pane-fields';
import type { ThemeUiState } from '../state/ui/theme-ui-state';
import { initialThemeUiState } from '../state/ui/theme-ui-state';

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

function baseState(hueAdjustment: number): ThemeUiState {
  const committed = deriveThemePaneFields({
    ...initialThemeUiState,
    theme,
    checkedColorRefs: ['editorForeground'],
    hueAdjustment: 0,
  });
  return {
    ...committed,
    hueAdjustment,
  };
}

describe('deriveThemePaneFields', () => {
  it('preserves preview assignments when deferPreview is true', () => {
    const before = baseState(0);
    const previewBefore = before.panePreviewColorAssignments;

    const after = deriveThemePaneFields(
      { ...before, hueAdjustment: 40 },
      { deferPreview: true },
    );

    expect(after.panePreviewColorAssignments).toBe(previewBefore);
    expect(after.paneDisplayColorAssignments).not.toEqual(before.paneDisplayColorAssignments);
  });

  it('updates preview assignments when deferPreview is false', () => {
    const before = baseState(0);
    const previewBefore = before.panePreviewColorAssignments;

    const after = deriveThemePaneFields(
      { ...before, hueAdjustment: 40 },
      { deferPreview: false },
    );

    expect(after.panePreviewColorAssignments).not.toBe(previewBefore);
    expect(after.panePreviewColorAssignments).toEqual(after.paneDisplayColorAssignments);
  });
});
