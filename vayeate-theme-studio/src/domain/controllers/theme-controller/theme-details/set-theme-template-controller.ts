import { singleton } from 'tsyringe';
import type { TemplateName, Version } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { loadTemplateSnapshot } from '../../../operations/template-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { AppStateSetter } from '../../../state/app-state-setter';
import { mergeAssignmentsFromTemplate } from '../../../utils/theme-template-merge';
import { SaveThemeController } from './save-theme-controller';

@singleton()
export class SetThemeTemplateController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly appStateSetter: AppStateSetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  async run(name: TemplateName, version: Version): Promise<void> {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme) return;
    const template = await loadTemplateSnapshot(name, version);
    if (!template) return;
    const merged = mergeAssignmentsFromTemplate(theme, template);
    this.setTheme.execute(merged);
    this.saveThemeController.run(merged);
    this.appStateSetter.apply({ type: 'SET_THEME_LOADED_TEMPLATE', template });
  }
}
