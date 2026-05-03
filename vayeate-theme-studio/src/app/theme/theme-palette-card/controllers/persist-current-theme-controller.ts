import { singleton } from 'tsyringe';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

/** Persist current theme (THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_CLOSE). */
@singleton()
export class PersistCurrentThemeController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(): void {
    const theme = this.themeUiStore.getStore().state.theme;
    if (theme) this.applyThemeStateAndSchedulePersist.execute(theme);
  }
}


