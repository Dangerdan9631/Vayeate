import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import { SaveThemeController } from './save-theme-controller';

/** Persist current theme (THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE). */
@singleton()
export class PersistCurrentThemeController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(): void {
    const theme = this.appStateGetter.current().themes.theme;
    if (theme) this.saveThemeController.run(theme);
  }
}
