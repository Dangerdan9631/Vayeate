import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../../../operations/theme-operations/theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../../../operations/theme-operations/theme-details/set-theme-operation';
import { ThemesStore } from '../../../state/theme/themes-store';

@singleton()
export class SetApplyPaletteToLightController {
  constructor(
    private readonly themesStateGetter: ThemesStore,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(checked: boolean): void {
    const theme = this.themesStateGetter.getStore().state.theme;
    if (!theme) return;
    const next: Theme = { ...theme, applyPaletteToLight: checked };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}


