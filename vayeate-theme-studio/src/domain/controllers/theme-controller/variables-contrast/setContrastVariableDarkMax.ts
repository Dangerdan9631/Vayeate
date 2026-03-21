import { singleton } from 'tsyringe';
import type { ContrastVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { SetTheme } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { parseContrastValue, updateContrastAssignment } from '../../../utils/contrast-utils';
import { SaveThemeController } from '../theme-details/saveTheme';

@singleton()
export class SetContrastVariableDarkMaxController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetTheme,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(ref: ContrastVariableKey | undefined, value: string): void {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme || ref == null) return;
    const num = value === '' || value == null ? null : parseContrastValue(value);
    const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', {
      max: num,
    });
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
