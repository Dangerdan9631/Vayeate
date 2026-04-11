import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../../../operations/theme-operations/theme-details/set-theme-operation';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetApplyPaletteToDarkController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(checked: boolean): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme) return;
    const next: Theme = { ...theme, applyPaletteToDark: checked };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}
