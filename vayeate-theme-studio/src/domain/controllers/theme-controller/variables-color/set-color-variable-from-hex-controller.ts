import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { normalizeHexSafe } from '../../../utils/color';
import { SaveThemeController } from '../theme-details/save-theme-controller';

@singleton()
export class SetColorVariableFromHexController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(ref: ColorVariableKey | undefined, hex: string, target: 'dark' | 'light'): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme || !ref) return;
    const normalized = normalizeHexSafe(hex);
    if (!normalized) return;
    const newAssignments = theme.colorAssignments.map((a) => {
      if (a.colorRef !== ref) return a;
      const next = { ...a };
      if (target === 'dark') next.dark = { value: normalized };
      else next.light = { value: normalized };
      return next;
    });
    const next: Theme = { ...theme, colorAssignments: newAssignments };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
