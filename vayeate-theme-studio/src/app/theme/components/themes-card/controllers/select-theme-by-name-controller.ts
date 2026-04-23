import { singleton } from 'tsyringe';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { GetThemeRefsOperation } from '../../../../../domain/operations/theme-operations/theme-list/get-theme-refs-operation';
import { LoadThemeOperation } from '../../../../../domain/operations/theme-operations/theme-details/load-theme-operation';
import { SetSelectedThemeRefOperation } from '../../../../../domain/operations/theme-operations/theme-list/set-selected-theme-ref-operation';
import { SetThemeLoadedTemplateOperation } from '../../../../../domain/operations/theme-operations/theme-details/set-theme-loaded-template-operation';
import { SetThemePaneSelectionsOperation } from '../../../../../domain/operations/theme-operations/pickers/set-theme-pane-selections-operation';
import { LoadTemplateSnapshotOperation } from '../../../../../domain/operations/template-operations/template-details/load-template-snapshot-operation';
import { findBestVersionRef } from '../../../../../domain/utils/find-best-version-ref';

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
  }
}
