import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { SaveThemeController } from '../theme-details/save-theme-controller';

@singleton()
export class SetPaletteClusterGroupToggledController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(groupId: string, checked: boolean): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme) return;
    const current = theme.paletteClusterGroupIds ?? [];
    const set = new Set(current);
    if (checked) set.add(groupId);
    else set.delete(groupId);
    const next: Theme = { ...theme, paletteClusterGroupIds: [...set] };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
