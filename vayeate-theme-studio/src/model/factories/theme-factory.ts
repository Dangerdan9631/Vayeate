import { themeSchema, type Theme } from '../schema/theme-schemas';

/**
 * User-supplied fields required to construct a new theme draft.
 */
export interface CreateThemeParams {
  name: string;
  sourceTheme?: Theme | null;
}

/**
 * Builds a new theme with default refs, assignments, and palette settings.
 *
 * @param params - Creation input; only the display name is required.
 * @returns A theme at version `1.0.0` with empty token refs and palette defaults.
 */
export function createThemeWithParams(params: CreateThemeParams): Theme {
  if (params.sourceTheme) {
    return themeSchema.parse({
      ...params.sourceTheme,
      name: params.name,
      version: '1.0.0',
    });
  }

  return {
    name: params.name,
    version: '1.0.0',
    templateRef: null,
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
    colorAssignments: [],
    contrastAssignments: [],
    styleAssignments: [],
    applyPaletteToDark: true,
    applyPaletteToLight: true,
    paletteClusterCountK: 5,
    paletteClusterGroupIds: [],
  };
}
