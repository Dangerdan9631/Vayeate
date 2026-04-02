import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { SaveThemeController } from '../theme-details/save-theme-controller';

@singleton()
export class SetColorUseDarkForLightController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(ref: ColorVariableKey | undefined, checked: boolean | undefined): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme || ref == null) return;
    const useDark = checked === true;
    const newAssignments = theme.colorAssignments.map((a) =>
      a.colorRef === ref ? { ...a, useDarkForLight: useDark } : a,
    );
    const next: Theme = { ...theme, colorAssignments: newAssignments };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
