import { singleton } from 'tsyringe';
import type { ContrastVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { parseContrastValue, updateContrastAssignment } from '../../../utils/contrast-utils';
import { SaveThemeController } from '../theme-details/save-theme-controller';

@singleton()
export class SetContrastVariableDarkMinController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(ref: ContrastVariableKey | undefined, value: string): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme || ref == null) return;
    const num = value === '' || value == null ? null : parseContrastValue(value);
    const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', {
      min: num,
    });
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
