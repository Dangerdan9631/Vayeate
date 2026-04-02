import { singleton } from 'tsyringe';
import type { ContrastValue } from '../../../../model/schemas';
import type { ContrastVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { parseContrastValue, updateContrastAssignment } from '../../../utils/contrast-utils';
import { SaveThemeController } from '../theme-details/save-theme-controller';

@singleton()
export class SetContrastVariableDarkValueController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(ref: ContrastVariableKey | undefined, value: ContrastValue): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme || ref == null) return;
    const num = typeof value === 'number' ? value : parseContrastValue(String(value));
    if (num == null) return;
    const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', {
      value: num,
    });
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
