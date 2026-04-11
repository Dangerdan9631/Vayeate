import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { SetThemeOperation } from '../../../operations/theme-operations/theme-details/set-theme-operation';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { normalizeHexSafe } from '../../../utils/color';
import { applyHueToAssignmentsFiltered } from '../../../utils/theme-assignment-utils';

@singleton()
export class SetAssignColorPreviewController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
  ) {}

  run(hex: string): void {
    const normalized = normalizeHexSafe(hex);
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
    const nextTheme: Theme = { ...theme, colorAssignments: newAssignments };
    this.setTheme.execute(nextTheme);
  }
}
