import { singleton } from 'tsyringe';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { LoadThemeOperation } from '../../../domain/operations/theme-operations/theme-details/load-theme-operation';
import { SetSelectedThemeRefOperation } from '../../../domain/operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemeLoadedTemplateOperation } from '../../../domain/operations/theme-operations/theme-details/set-theme-loaded-template-operation';
import { SetThemePaneSelectionsOperation } from '../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { LoadTemplateSnapshotOperation } from '../../../domain/operations/template-operations/template-details/load-template-snapshot-operation';
import { SetCurrentUndoStackIdOperation } from '../../../domain/operations/undo-operations/set-current-undo-stack-id-operation';
import { themeStackId } from '../../../domain/utils/theme-stack-id';

@singleton()
export class SelectThemeAndLoadController {
  constructor(
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly loadTheme: LoadThemeOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly loadTemplateSnapshot: LoadTemplateSnapshotOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly setThemeLoadedTemplate: SetThemeLoadedTemplateOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(name: string, version: string): Promise<void> {
    this.setSelectedThemeRef.execute({ name, version });
    const theme = await this.loadTheme.execute(name, version);
    this.setThemePaneSelections.execute([], []);
    const template =
      theme?.templateRef != null
        ? await this.loadTemplateSnapshot.execute(theme.templateRef.name, theme.templateRef.version)
        : null;
    if (theme) this.applyThemeStateAndSchedulePersist.execute(theme);
    this.setThemeLoadedTemplate.execute(template);
    this.setCurrentUndoStackId.execute(themeStackId(name, version));
  }
}
