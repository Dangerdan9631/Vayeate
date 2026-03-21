import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { SetTheme } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { SaveThemeController } from '../theme-details/saveTheme';

@singleton()
export class SetPaletteClusterGroupToggledController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetTheme,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(groupId: string, checked: boolean): void {
    const theme = this.appStateGetter.current().themes.theme;
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
