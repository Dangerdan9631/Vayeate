import { singleton } from 'tsyringe';
import type { ContrastComparisonMethod } from '../../../../model/schemas';
import type { ContrastVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { SetTheme } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { updateContrastAssignment } from '../../../utils/contrast-utils';
import { SaveThemeController } from '../theme-details/saveTheme';

@singleton()
export class SetContrastVariableDarkMethodController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetTheme,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(ref: ContrastVariableKey | undefined, value: ContrastComparisonMethod): void {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme || ref == null) return;
    const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', {
      comparisonMethod: value,
    });
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
