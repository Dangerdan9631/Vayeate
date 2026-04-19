import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../model/schema/primitives';
import type { Theme } from '../../../model/schema/theme-schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { ThemesStore } from '../../../domain/state/theme/themes-store';

@singleton()
export class SetColorUseDarkForLightController {
  constructor(
    private readonly themesStateGetter: ThemesStore,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(ref: ColorVariableKey | undefined, checked: boolean | undefined): void {
    const theme = this.themesStateGetter.getStore().state.theme;
    if (!theme || ref == null) return;
    const useDark = checked === true;
    const newAssignments = theme.colorAssignments.map((a) =>
      a.colorRef === ref ? { ...a, useDarkForLight: useDark } : a,
    );
    const next: Theme = { ...theme, colorAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}


