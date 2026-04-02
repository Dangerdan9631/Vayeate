import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { SaveThemeController } from '../theme-details/save-theme-controller';

@singleton()
export class SetPaletteClusterCountKController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(value: number): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme) return;
    const k = Math.max(1, Math.min(12, value));
    const next: Theme = { ...theme, paletteClusterCountK: k };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
