import { singleton } from 'tsyringe';
import type { TemplateName, Version } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { loadTemplateSnapshot } from '../../../operations/template-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import { mergeAssignmentsFromTemplate } from '../../../utils/theme-template-merge';
import { SaveThemeController } from './save-theme-controller';

@singleton()
export class SetThemeTemplateController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly themesStateSetter: ThemesStateSetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  async run(name: TemplateName, version: Version): Promise<void> {
    const theme = this.themesStateGetter.current().theme;
    if (!theme) return;
    const template = await loadTemplateSnapshot(name, version);
    if (!template) return;
    const merged = mergeAssignmentsFromTemplate(theme, template);
    this.setTheme.execute(merged);
    this.saveThemeController.run(merged);
    this.themesStateSetter.apply({ type: 'SET_THEME_LOADED_TEMPLATE', template });
  }
}
