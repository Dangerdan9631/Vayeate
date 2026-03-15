import type { Theme } from '../../../model/schemas';
import {
  setSelectedThemeRef,
  loadTheme,
  setTheme,
  type SetState,
} from '../../operations/theme-operations';
import { setCurrentUndoStackId } from '../../operations/undo-operations';
import { templateService } from '../../../gateway/services/template-service';
import { mergeAssignmentsFromTemplate } from '../../utils/theme-template-merge';
import { themeStackId } from './themeStackId';
import { saveTheme } from './saveTheme';

export async function selectThemeAndLoad(
  setState: SetState,
  name: string,
  version: string,
): Promise<void> {
  setSelectedThemeRef(setState, { name, version });
  const loaded = await loadTheme(setState, name, version);
  let templateForTheme: import('../../../model/schemas').Template | null = null;
  if (loaded?.templateRef) {
    const template = await templateService.loadTemplate(
      loaded.templateRef.name,
      loaded.templateRef.version,
    );
    if (template) {
      templateForTheme = template;
      const colorRefs = new Set(loaded.colorAssignments.map((a) => a.colorRef));
      const contrastRefs = new Set(loaded.contrastAssignments.map((a) => a.contrastVariableRef));
      const missingColor = template.colorVariables.some((v) => !colorRefs.has(v.key));
      const missingContrast = template.contrastVariables.some((v) => !contrastRefs.has(v.key));
      if (missingColor || missingContrast) {
        const merged = mergeAssignmentsFromTemplate({ ...loaded } as Theme, template);
        setTheme(setState, merged);
        saveTheme(setState, merged);
      }
    }
  }
  setState({ type: 'SET_THEME_LOADED_TEMPLATE', template: templateForTheme });
  setCurrentUndoStackId(setState, themeStackId(name, version));
}
