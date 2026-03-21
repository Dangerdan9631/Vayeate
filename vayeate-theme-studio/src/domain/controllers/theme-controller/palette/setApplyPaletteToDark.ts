import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { SetTheme } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { SaveThemeController } from '../theme-details/saveTheme';

@singleton()
export class SetApplyPaletteToDarkController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetTheme,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(checked: boolean): void {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme) return;
    const next: Theme = { ...theme, applyPaletteToDark: checked };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
