import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import {
  ApplyThemeStateAndSchedulePersistOperation,
  SetThemeHueAdjustmentOperation,
  SetThemeOperation,
} from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { applyHueToAssignmentsFiltered } from '../../../utils/theme-assignment-utils';

@singleton()
export class RecenterHueReferenceController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(): void {
    const state = this.themesStateGetter.current();
    const theme = state.theme;
    const hueAdjustment = state.hueAdjustment;
    if (!theme || hueAdjustment === 0) {
      this.setThemeHueAdjustment.execute(0);
      return;
    }
    const checkedColorRefs = new Set(state.checkedColorRefs);
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
    this.applyThemeStateAndSchedulePersist.execute(nextTheme);
    this.setThemeHueAdjustment.execute(0);
  }
}
