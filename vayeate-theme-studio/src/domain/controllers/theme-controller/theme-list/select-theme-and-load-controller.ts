import { singleton } from 'tsyringe';
import {
  ApplyThemeStateAndSchedulePersistOperation,
  LoadThemeOperation,
  SetSelectedThemeRefOperation,
  SetThemeLoadedTemplateOperation,
  SetThemePaneSelectionsOperation,
} from '../../../operations/theme-operations';
import { LoadTemplateSnapshotOperation } from '../../../operations/template-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';
import { themeStackId } from '../../../utils/stack-id';

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
