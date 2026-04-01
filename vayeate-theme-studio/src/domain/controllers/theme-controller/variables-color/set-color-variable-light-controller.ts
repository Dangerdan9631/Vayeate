import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { normalizeHexSafe } from '../../../utils/color';
import { SaveThemeController } from '../theme-details/save-theme-controller';

@singleton()
export class SetColorVariableLightController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(ref: ColorVariableKey | undefined, value: string): void {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme || !ref) return;
    const normalized = normalizeHexSafe(value);
    const newAssignments = theme.colorAssignments.map((a) =>
      a.colorRef === ref ? { ...a, light: normalized !== null ? { value: normalized } : null } : a,
    );
    const next: Theme = { ...theme, colorAssignments: newAssignments };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
