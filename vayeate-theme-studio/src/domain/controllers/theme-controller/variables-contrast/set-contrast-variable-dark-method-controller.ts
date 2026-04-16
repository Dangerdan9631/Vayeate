import { singleton } from 'tsyringe';
import type { ContrastComparisonMethod } from '../../../../model/schemas';
import type { ContrastVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../../../operations/theme-operations/theme-details/set-theme-operation';
import { ThemesStore } from '../../../state/theme/themes-store';
import { updateContrastAssignment } from '../../../utils/contrast-utils';

@singleton()
export class SetContrastVariableDarkMethodController {
  constructor(
    private readonly themesStateGetter: ThemesStore,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  async run(ref: ContrastVariableKey | undefined, value: ContrastComparisonMethod): Promise<void> {
    const theme = this.themesStateGetter.getStore().state.theme;
    if (!theme || ref == null) return;
    const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', {
      comparisonMethod: value,
    });
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}


