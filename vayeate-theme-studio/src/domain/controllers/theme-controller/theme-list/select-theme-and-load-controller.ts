import { singleton } from 'tsyringe';
import {
  LoadThemeOperation,
  SetSelectedThemeRefOperation,
  SetThemePaneSelectionsOperation,
} from '../../../operations/theme-operations';
import { LoadTemplateSnapshotOperation } from '../../../operations/template-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeLoadedTemplateOperation } from '../../../operations/theme-operations/theme-details/set-theme-loaded-template-operation';
import type { Theme } from '../../../../model/schemas';
import { mergeAssignmentsFromTemplate } from '../../../utils/theme-template-merge';
import { themeStackId } from '../../../utils/stack-id';

@singleton()
export class SelectThemeAndLoadController {
  constructor(
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly loadTheme: LoadThemeOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
    private readonly loadTemplateSnapshot: LoadTemplateSnapshotOperation,
    private readonly setThemeLoadedTemplate: SetThemeLoadedTemplateOperation,
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
      const template = await this.loadTemplateSnapshot.execute(
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
          this.applyThemeStateAndSchedulePersist.execute(merged);
        }
      }
    }
    this.setThemeLoadedTemplate.execute(templateForTheme);
    this.setCurrentUndoStackId.execute(themeStackId(name, version));
  }
}
