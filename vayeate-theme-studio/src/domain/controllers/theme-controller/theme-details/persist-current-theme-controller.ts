import { singleton } from 'tsyringe';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';

/** Persist current theme (THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE). */
@singleton()
export class PersistCurrentThemeController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(): void {
    const theme = this.themesStateGetter.current().theme;
    if (theme) this.applyThemeStateAndSchedulePersist.execute(theme);
  }
}
