import { singleton } from 'tsyringe';
import {
  ApplyThemeStateAndSchedulePersistOperation,
  GetThemeRefsOperation,
  LoadThemeOperation,
  SetSelectedThemeRefOperation,
  SetThemeLoadedTemplateOperation,
  SetThemePaneSelectionsOperation,
} from '../../../operations/theme-operations';
import { LoadTemplateSnapshotOperation } from '../../../operations/template-operations';
import { SetCurrentUndoStackIdOperation } from '../../../operations/undo-operations';
import { findBestVersionRef } from '../../../utils/version';
import { themeStackId } from '../../../utils/stack-id';

@singleton()
export class SelectThemeByNameController {
  constructor(
    private readonly getThemeRefs: GetThemeRefsOperation,
    private readonly setSelectedThemeRef: SetSelectedThemeRefOperation,
    private readonly loadTheme: LoadThemeOperation,
    private readonly setThemePaneSelections: SetThemePaneSelectionsOperation,
    private readonly loadTemplateSnapshot: LoadTemplateSnapshotOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly setThemeLoadedTemplate: SetThemeLoadedTemplateOperation,
    private readonly setCurrentUndoStackId: SetCurrentUndoStackIdOperation,
  ) {}

  async run(name: string): Promise<void> {
    const best = findBestVersionRef(this.getThemeRefs.execute(), name);
    if (!best) return;
    this.setSelectedThemeRef.execute({ name: best.name, version: best.version });
    const theme = await this.loadTheme.execute(best.name, best.version);
    this.setThemePaneSelections.execute([], []);
    const template =
      theme?.templateRef != null
        ? await this.loadTemplateSnapshot.execute(theme.templateRef.name, theme.templateRef.version)
        : null;
    if (theme) this.applyThemeStateAndSchedulePersist.execute(theme);
    this.setThemeLoadedTemplate.execute(template);
    this.setCurrentUndoStackId.execute(themeStackId(best.name, best.version));
  }
}
