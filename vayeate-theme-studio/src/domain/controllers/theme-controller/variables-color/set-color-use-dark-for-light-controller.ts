import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { SaveThemeController } from '../theme-details/save-theme-controller';

@singleton()
export class SetColorUseDarkForLightController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(ref: ColorVariableKey | undefined, checked: boolean | undefined): void {
    const theme = this.appStateGetter.current().themes.theme;
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
