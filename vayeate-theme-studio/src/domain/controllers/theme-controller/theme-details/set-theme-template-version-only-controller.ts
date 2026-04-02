import { singleton } from 'tsyringe';
import type { Version } from '../../../../model/schemas';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { SetThemeTemplateController } from './set-theme-template-controller';

/** Set template version for current theme (THEME_DETAILS_CATALOG_VERSION_LIST = template version). */
@singleton()
export class SetThemeTemplateVersionOnlyController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setThemeTemplate: SetThemeTemplateController,
  ) {}

  async run(version: Version): Promise<void> {
    const theme = this.themesStateGetter.current().theme;
    if (!theme?.templateRef) return;
    await this.setThemeTemplate.run(theme.templateRef.name, version);
  }
}
