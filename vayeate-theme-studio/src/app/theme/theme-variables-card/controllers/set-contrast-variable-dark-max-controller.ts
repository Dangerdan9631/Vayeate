import { singleton } from 'tsyringe';
import type { ContrastVariableKey } from '../../../../model/schema/primitives';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';
import { parseContrastValue, updateContrastAssignment } from '../../../../domain/utils/contrast-utils';

@singleton()
export class SetContrastVariableDarkMaxController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(ref: ContrastVariableKey | undefined, value: string): void {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme || ref == null) return;
    const num = value === '' || value == null ? null : parseContrastValue(value);
    const newAssignments = updateContrastAssignment(theme.contrastAssignments, ref, 'dark', {
      max: num,
    });
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}


