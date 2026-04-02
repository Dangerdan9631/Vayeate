import { singleton } from 'tsyringe';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { SaveThemeController } from './save-theme-controller';

/** Persist current theme (THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE). */
@singleton()
export class PersistCurrentThemeController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(): void {
    const theme = this.themesStateGetter.current().theme;
    if (theme) this.saveThemeController.run(theme);
  }
}
