import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import {
  LoadTheme,
  SetSelectedThemeRef,
  SetTheme,
  SetThemePaneSelections,
} from '../../../operations/theme-operations';
import { loadTemplateSnapshot } from '../../../operations/template-operations';
import { SetCurrentUndoStackId } from '../../../operations/undo-operations';
import { AppStateSetter } from '../../../state/app-state-setter';
import { mergeAssignmentsFromTemplate } from '../../../utils/theme-template-merge';
import { themeStackId } from '../../../utils/stack-id';
import { SaveThemeController } from '../theme-details/saveTheme';

@singleton()
export class SelectThemeAndLoadController {
  constructor(
    private readonly setSelectedThemeRef: SetSelectedThemeRef,
    private readonly loadTheme: LoadTheme,
    private readonly setThemePaneSelections: SetThemePaneSelections,
    private readonly setTheme: SetTheme,
    private readonly saveThemeController: SaveThemeController,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackId,
    private readonly appStateSetter: AppStateSetter,
  ) {}

  async run(name: string, version: string): Promise<void> {
    this.setSelectedThemeRef.execute({ name, version });
    const loaded = await this.loadTheme.execute(name, version);
    if (loaded) {
      this.setThemePaneSelections.execute(
        loaded.colorAssignments.map((a) => a.colorRef),
        loaded.contrastAssignments.map((a) => a.contrastVariableRef),
      );
    }
    let templateForTheme: import('../../../../model/schemas').Template | null = null;
    if (loaded?.templateRef) {
      const template = await loadTemplateSnapshot(
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
          this.setTheme.execute(merged);
          this.saveThemeController.run(merged);
        }
      }
    }
    this.appStateSetter.apply({ type: 'SET_THEME_LOADED_TEMPLATE', template: templateForTheme });
    this.setCurrentUndoStackId.execute(themeStackId(name, version));
  }
}
