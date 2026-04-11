import { singleton } from 'tsyringe';
import type { ContrastVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../../../operations/theme-operations/theme-details/set-theme-operation';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { parseContrastValue, updateContrastAssignment } from '../../../utils/contrast-utils';

@singleton()
export class SetContrastVariableDarkMinController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  async run(ref: ContrastVariableKey | undefined, value: string): Promise<void> {
    const theme = this.themesStateGetter.current().theme;
    if (!theme || ref == null) return;
    const num = value === '' || value == null ? null : parseContrastValue(value);
    const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', {
      min: num,
    });
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}
