import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { normalizeHexSafe } from '../../../utils/color';
import { SaveThemeController } from '../theme-details/save-theme-controller';

@singleton()
export class SetColorVariableDarkController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(ref: ColorVariableKey | undefined, value: string): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme || !ref) return;
    const normalized = normalizeHexSafe(value);
    const newAssignments = theme.colorAssignments.map((a) =>
      a.colorRef === ref ? { ...a, dark: normalized !== null ? { value: normalized } : null } : a,
    );
    const next: Theme = { ...theme, colorAssignments: newAssignments };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
