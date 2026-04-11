import { singleton } from 'tsyringe';
import type { ContrastComparisonMethod } from '../../../../model/schemas';
import type { ContrastVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import {
  ApplyThemeStateAndSchedulePersistOperation,
  SetThemeOperation,
} from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { updateContrastAssignment } from '../../../utils/contrast-utils';

@singleton()
export class SetContrastVariableLightMethodController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(ref: ContrastVariableKey | undefined, value: ContrastComparisonMethod): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme || ref == null) return;
    const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'light', {
      comparisonMethod: value,
    });
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}
