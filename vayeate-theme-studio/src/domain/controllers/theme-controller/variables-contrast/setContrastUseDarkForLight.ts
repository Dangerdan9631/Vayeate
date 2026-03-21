import { singleton } from 'tsyringe';
import type { ContrastVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { SetTheme } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { SaveThemeController } from '../theme-details/saveTheme';

@singleton()
export class SetContrastUseDarkForLightController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetTheme,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(ref: ContrastVariableKey | undefined, checked: boolean | undefined): void {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme || ref == null) return;
    const useDark = checked === true;
    const newAssignments = theme.contrastAssignments.map((a) =>
      a.contrastVariableRef === ref ? { ...a, useDarkForLight: useDark } : a,
    );
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
