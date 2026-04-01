import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import {
  LoadThemeOperation,
  SetSelectedThemeRefOperation,
  SetThemeOperation,
  SetThemePaneSelectionsOperation,
} from '../../../operations/theme-operations';
import { loadTemplateSnapshot } from '../../../operations/template-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';
import { AppStateSetter } from '../../../state/app-state-setter';
import { mergeAssignmentsFromTemplate } from '../../../utils/theme-template-merge';
import { themeStackId } from '../../../utils/stack-id';
import { SaveThemeController } from '../theme-details/save-theme-controller';

@singleton()
export class SelectThemeAndLoadController {
  constructor(
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly loadTheme: LoadThemeOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
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
        const missingColor = template.colorVariables.some((v: { key: string }) => !colorRefs.has(v.key));
        const missingContrast = template.contrastVariables.some(
          (v: { key: string }) => !contrastRefs.has(v.key),
        );
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
