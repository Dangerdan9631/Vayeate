import { singleton } from 'tsyringe';
import type { ContrastComparisonMethod } from '../../../../model/schemas';
import type { ContrastVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { updateContrastAssignment } from '../../../utils/contrast-utils';
import { SaveThemeController } from '../theme-details/save-theme-controller';

@singleton()
export class SetContrastVariableLightMethodController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(ref: ContrastVariableKey | undefined, value: ContrastComparisonMethod): void {
    const theme = this.appStateGetter.current().themes.theme;
    if (!theme || ref == null) return;
    const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'light', {
      comparisonMethod: value,
    });
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.saveThemeController.run(next);
  }
}
