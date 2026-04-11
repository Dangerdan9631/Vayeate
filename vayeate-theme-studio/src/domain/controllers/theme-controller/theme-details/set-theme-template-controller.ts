import { singleton } from 'tsyringe';
import type { TemplateName, Version } from '../../../../model/schemas';
import { LoadTemplateSnapshotOperation } from '../../../operations/template-operations/template-details/load-template-snapshot-operation';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeLoadedTemplateOperation } from '../../../operations/theme-operations/theme-details/set-theme-loaded-template-operation';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { mergeAssignmentsFromTemplate } from '../../../utils/theme-template-merge';

@singleton()
export class SetThemeTemplateController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly loadTemplateSnapshot: LoadTemplateSnapshotOperation,
    private readonly setThemeLoadedTemplate: SetThemeLoadedTemplateOperation,
  ) {}

  async run(name: TemplateName, version: Version): Promise<void> {
    const theme = this.themesStateGetter.current().theme;
    if (!theme) return;
    const template = await this.loadTemplateSnapshot.execute(name, version);
    if (!template) return;
    const merged = mergeAssignmentsFromTemplate(theme, template);
    this.applyThemeStateAndSchedulePersist.execute(merged);
    this.setThemeLoadedTemplate.execute(template);
  }
}
