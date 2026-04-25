import { singleton } from 'tsyringe';
import type { TemplateName, Version } from '../../../../model/schema/primitives';
import { LoadTemplateSnapshotOperation } from '../../../../domain/operations/template-operations/template-details/load-template-snapshot-operation';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeLoadedTemplateOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-loaded-template-operation';
import { ThemesStore } from '../../../../domain/state/theme/themes-store';
import { mergeAssignmentsFromTemplate } from '../../../../domain/utils/theme-template-merge';

@singleton()
export class SetThemeTemplateController {
  constructor(
    private readonly themesStateGetter: ThemesStore,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
    private readonly loadTemplateSnapshot: LoadTemplateSnapshotOperation,
    private readonly setThemeLoadedTemplate: SetThemeLoadedTemplateOperation,
  ) {}

  async run(name: TemplateName, version: Version): Promise<void> {
    const theme = this.themesStateGetter.getStore().state.theme;
    if (!theme) return;
    const template = await this.loadTemplateSnapshot.execute(name, version);
    if (!template) return;
    const merged = mergeAssignmentsFromTemplate(theme, template);
    this.applyThemeStateAndSchedulePersist.execute(merged);
    this.setThemeLoadedTemplate.execute(template);
  }
}


