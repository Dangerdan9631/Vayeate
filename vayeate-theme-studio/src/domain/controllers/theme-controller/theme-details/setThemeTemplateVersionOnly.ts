import { singleton } from 'tsyringe';
import type { Version } from '../../../../model/schemas';
import { AppStateGetter } from '../../../state/app-state-getter';
import { SetThemeTemplateController } from './setThemeTemplate';

/** Set template version for current theme (THEME_DETAILS_CATALOG_VERSION_LIST = template version). */
@singleton()
export class SetThemeTemplateVersionOnlyController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setThemeTemplate: SetThemeTemplateController,
  ) {}

  async run(version: Version): Promise<void> {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme?.templateRef) return;
    await this.setThemeTemplate.run(theme.templateRef.name, version);
  }
}
