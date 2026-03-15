import type {
  ColorAssignment,
  ContrastAssignment,
  Template,
  Theme,
} from '../model/schemas';

/**
 * Merge template color/contrast variables and mappings into a theme.
 * Used when changing theme template or template version.
 */
export function mergeAssignmentsFromTemplate(theme: Theme, template: Template): Theme {
  const templateRef = { name: template.name, version: template.version };

  const existingColorMap = new Map<string, ColorAssignment>();
  for (const a of theme.colorAssignments) {
    existingColorMap.set(a.colorRef, a);
  }

  const newColorAssignments: ColorAssignment[] = template.colorVariables.map((v) => {
    const existing = existingColorMap.get(v.key);
    if (existing) return existing;
    return { colorRef: v.key, light: null, dark: null, useDarkForLight: false };
  });

  const existingContrastMap = new Map<string, ContrastAssignment>();
  for (const a of theme.contrastAssignments) {
    existingContrastMap.set(a.contrastVariableRef, a);
  }

  const newContrastAssignments: ContrastAssignment[] = template.contrastVariables.map((v) => {
    const existing = existingContrastMap.get(v.key);
    if (existing) return existing;
    return { contrastVariableRef: v.key, light: null, dark: null, useDarkForLight: false };
  });

  const themeTokenKeys = [...new Set(
    template.mappings
      .filter((m) => m.token.type === 'theme' && m.colorVariableRef != null)
      .map((m) => m.token.key),
  )].sort();
  const validTokenRef = (tokenRef: string | null | undefined) =>
    tokenRef != null && themeTokenKeys.includes(tokenRef) ? tokenRef : null;

  const idePrimaryTokenRef = validTokenRef(theme.idePrimaryTokenRef);
  const ideForegroundTokenRef = validTokenRef(theme.ideForegroundTokenRef);
  const themeBackgroundTokenRef = validTokenRef(theme.themeBackgroundTokenRef);
  const themeForegroundTokenRef = validTokenRef(theme.themeForegroundTokenRef);
  const lineNumberBackgroundTokenRef = validTokenRef(theme.lineNumberBackgroundTokenRef);
  const lineNumberForegroundTokenRef = validTokenRef(theme.lineNumberForegroundTokenRef);
  const ideTabTokenRef = validTokenRef(theme.ideTabTokenRef);
  const ideTabBarBackgroundTokenRef = validTokenRef(theme.ideTabBarBackgroundTokenRef);
  const ideTabBarForegroundTokenRef = validTokenRef(theme.ideTabBarForegroundTokenRef);
  const editorPreviewScrollbarBackgroundTokenRef = validTokenRef(theme.editorPreviewScrollbarBackgroundTokenRef);
  const editorPreviewScrollbarForegroundTokenRef = validTokenRef(theme.editorPreviewScrollbarForegroundTokenRef);
  const editorPreviewSelectionBackgroundTokenRef = validTokenRef(theme.editorPreviewSelectionBackgroundTokenRef);
  const editorPreviewMenuForegroundTokenRef = validTokenRef(theme.editorPreviewMenuForegroundTokenRef);
  const editorPreviewMenuBackgroundTokenRef = validTokenRef(theme.editorPreviewMenuBackgroundTokenRef);

  return {
    ...theme,
    templateRef,
    idePrimaryTokenRef,
    ideForegroundTokenRef,
    themeBackgroundTokenRef,
    themeForegroundTokenRef,
    lineNumberBackgroundTokenRef,
    lineNumberForegroundTokenRef,
    ideTabTokenRef,
    ideTabBarBackgroundTokenRef,
    ideTabBarForegroundTokenRef,
    editorPreviewScrollbarBackgroundTokenRef,
    editorPreviewScrollbarForegroundTokenRef,
    editorPreviewSelectionBackgroundTokenRef,
    editorPreviewMenuForegroundTokenRef,
    editorPreviewMenuBackgroundTokenRef,
    colorAssignments: newColorAssignments,
    contrastAssignments: newContrastAssignments,
  };
}
