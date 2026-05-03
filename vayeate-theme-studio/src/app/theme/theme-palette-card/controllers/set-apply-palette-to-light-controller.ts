import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../../domain/operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../../../../domain/operations/theme-operations/theme-details/set-theme-operation';
import { ThemeUiStore } from '../../../../domain/state/ui/theme-ui-store';

@singleton()
export class SetApplyPaletteToLightController {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(checked: boolean): void {
    const theme = this.themeUiStore.getStore().state.theme;
    if (!theme) return;
    const next: Theme = { ...theme, applyPaletteToLight: checked };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}


