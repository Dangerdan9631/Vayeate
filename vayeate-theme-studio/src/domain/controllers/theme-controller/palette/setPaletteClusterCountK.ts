import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { SetTheme } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { SaveThemeController } from '../theme-details/saveTheme';

@singleton()
export class SetPaletteClusterCountKController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetTheme,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(value: number): void {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme) return;
    const k = Math.max(1, Math.min(12, value));
    const next: Theme = { ...theme, paletteClusterCountK: k };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
