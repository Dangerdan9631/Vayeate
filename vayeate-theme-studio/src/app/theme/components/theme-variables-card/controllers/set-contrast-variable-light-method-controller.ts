import { singleton } from 'tsyringe';
import type { ContrastComparisonMethod } from '../../../../../model/schema/primitives';
import type { ContrastVariableKey } from '../../../../../model/schema/primitives';
import type { Theme } from '../../../../../model/schema/theme-schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { ThemesStore } from '../../../../../domain/state/theme/themes-store';
import { updateContrastAssignment } from '../../../../../domain/utils/contrast-utils';

@singleton()
export class SetContrastVariableLightMethodController {
  constructor(
    private readonly themesStateGetter: ThemesStore,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(ref: ContrastVariableKey | undefined, value: ContrastComparisonMethod): void {
    const theme = this.themesStateGetter.getStore().state.theme;
    if (!theme || ref == null) return;
    const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'light', {
      comparisonMethod: value,
    });
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}


