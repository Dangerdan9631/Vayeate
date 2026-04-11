import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ApplyThemeStateAndSchedulePersistOperation } from '../theme-details/apply-theme-state-and-schedule-persist-operation';
import { SetThemeOperation } from '../theme-details/set-theme-operation';
import { SetThemeHueAdjustmentOperation } from '../palette-hue/set-theme-hue-adjustment-operation';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { normalizeHexSafe } from '../../../utils/color';
import { applyHueToAssignmentsFiltered } from '../../../utils/theme-assignment-utils';

/** Applies bulk color text from picker/eyedropper to checked color refs and persists. */
@singleton()
export class CommitAssignColorTextOperation {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  execute(value: string): void {
    const normalized = normalizeHexSafe(value);
    if (!normalized) return;
    const state = this.themesStateGetter.current();
    const theme = state.theme;
    const checkedColorRefs = new Set(state.checkedColorRefs);
    if (!theme || checkedColorRefs.size === 0) return;
    const applyToDark = theme.applyPaletteToDark ?? true;
    const applyToLight = theme.applyPaletteToLight ?? true;
    const hueAdjustment = state.hueAdjustment;
    let workingAssignments = theme.colorAssignments;
    if (hueAdjustment !== 0) {
      workingAssignments = applyHueToAssignmentsFiltered(
        theme.colorAssignments,
        hueAdjustment / 100,
        checkedColorRefs,
        { applyToDark, applyToLight },
      );
    }
    const newAssignments = workingAssignments.map((a) => {
      if (!checkedColorRefs.has(a.colorRef)) return a;
      let next = { ...a };
      if (applyToDark) next = { ...next, dark: { value: normalized } };
      if (applyToLight) next = { ...next, light: { value: normalized } };
      return next;
    });
    const base = { ...theme };
    const nextTheme: Theme = { ...base, colorAssignments: newAssignments };
    this.setThemeHueAdjustment.execute(0);
    this.setTheme.execute(nextTheme);
    this.applyThemeStateAndSchedulePersist.execute(nextTheme);
  }
}
