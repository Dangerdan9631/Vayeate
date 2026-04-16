import { singleton } from 'tsyringe';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { ThemesStore } from '../../../state/theme/themes-store';

/** Persist current theme (THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE). */
@singleton()
export class PersistCurrentThemeController {
  constructor(
    private readonly themesStateGetter: ThemesStore,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  async run(): Promise<void> {
    const theme = this.themesStateGetter.getStore().state.theme;
    if (theme) this.applyThemeStateAndSchedulePersist.execute(theme);
  }
}


