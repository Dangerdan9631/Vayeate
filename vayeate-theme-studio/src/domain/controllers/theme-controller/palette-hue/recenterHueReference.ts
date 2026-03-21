import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { SetTheme, SetThemeHueAdjustment } from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { applyHueToAssignmentsFiltered } from '../../../utils/theme-assignment-utils';
import { SaveThemeController } from '../theme-details/saveTheme';

@singleton()
export class RecenterHueReferenceController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetTheme,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustment,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(): void {
    const state = this.appStateGetter.current();
    const theme = state.themes.theme;
    const hueAdjustment = state.themes.hueAdjustment;
    if (!theme || hueAdjustment === 0) {
      this.setThemeHueAdjustment.execute(0);
      return;
    }
    const checkedColorRefs = new Set(state.themes.checkedColorRefs);
    const applyToDark = theme.applyPaletteToDark ?? true;
    const applyToLight = theme.applyPaletteToLight ?? true;
    const newAssignments = applyHueToAssignmentsFiltered(
      theme.colorAssignments,
      hueAdjustment / 100,
      checkedColorRefs,
      { applyToDark, applyToLight },
    );
    const nextTheme: Theme = { ...theme, colorAssignments: newAssignments };
    this.setTheme.execute(nextTheme);
    this.saveThemeController.run(nextTheme);
    this.setThemeHueAdjustment.execute(0);
  }
}
