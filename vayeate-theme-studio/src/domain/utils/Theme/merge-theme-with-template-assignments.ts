import type { Template } from '../../../model/Template/schema/template-schemas';
import type {
  ColorAssignment,
  ContrastAssignment,
  StyleAssignment,
  Theme,
} from '../../../model/Theme/schema/theme-schemas';

/**
 * Aligns persisted theme assignments and preview token refs with a linked template.
 *
 * @param theme - Persisted theme.
 * @param template - Linked template loaded from persistence.
 * @returns Theme with assignment rows and token references aligned to the template.
 */
export function mergeThemeWithTemplateAssignments(theme: Theme, template: Template): Theme {
  const templateRef = { name: template.name, version: template.version };

  const existingColorMap = new Map<string, ColorAssignment>();
  for (const assignment of theme.colorAssignments) {
    existingColorMap.set(assignment.colorRef, assignment);
  }
  const colorAssignments: ColorAssignment[] = template.colorVariables.map((variable) => {
    const existing = existingColorMap.get(variable.key);
    return existing ?? { colorRef: variable.key, light: null, dark: null, useDarkForLight: false };
  });

  const existingContrastMap = new Map<string, ContrastAssignment>();
  for (const assignment of theme.contrastAssignments) {
    existingContrastMap.set(assignment.contrastVariableRef, assignment);
  }
  const contrastAssignments: ContrastAssignment[] = template.contrastVariables.map((variable) => {
    const existing = existingContrastMap.get(variable.key);
    return existing ?? {
      contrastVariableRef: variable.key,
      light: null,
      dark: null,
      useDarkForLight: false,
    };
  });

  const existingStyleMap = new Map<string, StyleAssignment>();
  for (const assignment of theme.styleAssignments ?? []) {
    existingStyleMap.set(assignment.styleVariableRef, assignment);
  }
  const styleAssignments: StyleAssignment[] = (template.styleVariables ?? []).map((variable) => {
    const existing = existingStyleMap.get(variable.key);
    return existing ?? {
      styleVariableRef: variable.key,
      light: null,
      dark: null,
      useDarkForLight: false,
    };
  });

  const themeTokenKeys = [...new Set(
    template.mappings
      .filter((mapping) =>
        mapping.ignored !== true
        && mapping.token.type === 'theme'
        && mapping.colorVariableRef != null)
      .map((mapping) => mapping.token.key),
  )].sort();
  const validTokenRef = (tokenRef: string | null | undefined) =>
    tokenRef != null && themeTokenKeys.includes(tokenRef) ? tokenRef : null;

  return {
    ...theme,
    templateRef,
    idePrimaryTokenRef: validTokenRef(theme.idePrimaryTokenRef),
    ideForegroundTokenRef: validTokenRef(theme.ideForegroundTokenRef),
    themeBackgroundTokenRef: validTokenRef(theme.themeBackgroundTokenRef),
    themeForegroundTokenRef: validTokenRef(theme.themeForegroundTokenRef),
    lineNumberBackgroundTokenRef: validTokenRef(theme.lineNumberBackgroundTokenRef),
    lineNumberForegroundTokenRef: validTokenRef(theme.lineNumberForegroundTokenRef),
    ideTabTokenRef: validTokenRef(theme.ideTabTokenRef),
    ideTabBarBackgroundTokenRef: validTokenRef(theme.ideTabBarBackgroundTokenRef),
    ideTabBarForegroundTokenRef: validTokenRef(theme.ideTabBarForegroundTokenRef),
    editorPreviewScrollbarBackgroundTokenRef: validTokenRef(
      theme.editorPreviewScrollbarBackgroundTokenRef,
    ),
    editorPreviewScrollbarForegroundTokenRef: validTokenRef(
      theme.editorPreviewScrollbarForegroundTokenRef,
    ),
    editorPreviewSelectionBackgroundTokenRef: validTokenRef(
      theme.editorPreviewSelectionBackgroundTokenRef,
    ),
    editorPreviewMenuForegroundTokenRef: validTokenRef(theme.editorPreviewMenuForegroundTokenRef),
    editorPreviewMenuBackgroundTokenRef: validTokenRef(theme.editorPreviewMenuBackgroundTokenRef),
    colorAssignments,
    contrastAssignments,
    styleAssignments,
  };
}
