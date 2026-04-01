import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { SaveThemeController } from './save-theme-controller';

/** Template "use template" toggle: clear templateRef when unchecked (THEME_DETAILS_CATALOG_CHECKBOX = template checkbox). */
@singleton()
export class SetThemeTemplateToggleController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(checked: boolean): void {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme) return;
    if (!checked) {
      const withoutTemplate: Theme = { ...theme, templateRef: null };
      this.setTheme.execute(withoutTemplate);
      this.saveThemeController.run(withoutTemplate);
    }
  }
}
