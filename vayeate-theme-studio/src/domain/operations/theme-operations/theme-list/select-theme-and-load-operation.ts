import { singleton } from 'tsyringe';
import type { Template, Theme } from '../../../../model/schemas';
import { mergeAssignmentsFromTemplate } from '../../../utils/theme-template-merge';
import { themeStackId } from '../../../utils/stack-id';
import { SetCurrentUndoStackIdOperation } from '../../undo-operations';
import { LoadTemplateSnapshotOperation } from '../../template-operations';
import { ApplyThemeStateAndSchedulePersistOperation } from '../theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeLoadedTemplateOperation } from '../theme-details/set-theme-loaded-template-operation';
import { LoadThemeOperation } from '../theme-details/load-theme-operation';
import { SetSelectedThemeRefOperation } from './set-selected-theme-ref-operation';
import { SetThemePaneSelectionsOperation } from '../pickers/set-theme-pane-selections-operation';

/** Select theme ref, load theme + template snapshot, merge assignments if needed, set undo stack. */
@singleton()
export class SelectThemeAndLoadOperation {
  constructor(
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly loadTheme: LoadThemeOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
    private readonly loadTemplateSnapshot: LoadTemplateSnapshotOperation,
    private readonly setThemeLoadedTemplate: SetThemeLoadedTemplateOperation,
  ) {}

  async execute(name: string, version: string): Promise<void> {
    this.setSelectedThemeRef.execute({ name, version });
    const loaded = await this.loadTheme.execute(name, version);
    if (loaded) {
      this.setThemePaneSelections.execute(
        loaded.colorAssignments.map((a) => a.colorRef),
        loaded.contrastAssignments.map((a) => a.contrastVariableRef),
      );
    }
    let templateForTheme: Template | null = null;
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
