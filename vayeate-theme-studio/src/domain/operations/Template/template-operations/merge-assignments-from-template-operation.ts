import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/Template/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment, StyleAssignment, Theme } from '../../../../model/Theme/schema/theme-schemas';

/**
 * Merges template variables into a theme when the theme's template changes.
 */
@singleton()
export class MergeAssignmentsFromTemplateOperation {
  /**
   * Merges template color, contrast, and style variables into a theme.
   * @param theme Existing theme whose assignments and token refs are preserved when valid.
   * @param template Target template supplying variable keys and template ref.
   * @returns New theme with merged assignments and sanitized preview token refs.
   */
  execute(theme: Theme, template: Template): Theme {
    const templateRef = { name: template.name, version: template.version };

    const existingColorMap = new Map<string, ColorAssignment>();
    for (const assignment of theme.colorAssignments) {
      existingColorMap.set(assignment.colorRef, assignment);
    }

    const newColorAssignments: ColorAssignment[] = template.colorVariables.map((variable) => {
      const existing = existingColorMap.get(variable.key);
      if (existing) return existing;
      return { colorRef: variable.key, light: null, dark: null, useDarkForLight: false };
    });

    const existingContrastMap = new Map<string, ContrastAssignment>();
    for (const assignment of theme.contrastAssignments) {
      existingContrastMap.set(assignment.contrastVariableRef, assignment);
    }

    const newContrastAssignments: ContrastAssignment[] = template.contrastVariables.map((variable) => {
      const existing = existingContrastMap.get(variable.key);
      if (existing) return existing;
      return { contrastVariableRef: variable.key, light: null, dark: null, useDarkForLight: false };
    });

    const existingStyleMap = new Map<string, StyleAssignment>();
    for (const assignment of theme.styleAssignments ?? []) {
      existingStyleMap.set(assignment.styleVariableRef, assignment);
    }

    const newStyleAssignments: StyleAssignment[] = (template.styleVariables ?? []).map((variable) => {
      const existing = existingStyleMap.get(variable.key);
      if (existing) return existing;
      return { styleVariableRef: variable.key, light: null, dark: null, useDarkForLight: false };
    });

    const themeTokenKeys = [...new Set(
      template.mappings
        .filter((mapping) => mapping.ignored !== true && mapping.token.type === 'theme' && mapping.colorVariableRef != null)
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
      editorPreviewScrollbarBackgroundTokenRef: validTokenRef(theme.editorPreviewScrollbarBackgroundTokenRef),
      editorPreviewScrollbarForegroundTokenRef: validTokenRef(theme.editorPreviewScrollbarForegroundTokenRef),
      editorPreviewSelectionBackgroundTokenRef: validTokenRef(theme.editorPreviewSelectionBackgroundTokenRef),
      editorPreviewMenuForegroundTokenRef: validTokenRef(theme.editorPreviewMenuForegroundTokenRef),
      editorPreviewMenuBackgroundTokenRef: validTokenRef(theme.editorPreviewMenuBackgroundTokenRef),
      colorAssignments: newColorAssignments,
      contrastAssignments: newContrastAssignments,
      styleAssignments: newStyleAssignments,
    };
  }
}
