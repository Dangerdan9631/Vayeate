import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import {
  SetThemeOperation,
  SetThemeHueAdjustmentOperation,
} from '../../../operations/theme-operations';
import { AppStateGetter } from '../../../state/app-state-getter';
import { normalizeHexSafe } from '../../../utils/color';
import { applyHueToAssignmentsFiltered } from '../../../utils/theme-assignment-utils';
import { SaveThemeController } from '../theme-details/save-theme-controller';

@singleton()
export class CommitAssignColorTextController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly setThemeHueAdjustment: SetThemeHueAdjustmentOperation,
    private readonly saveThemeController: SaveThemeController,
  ) {}

  run(value: string): void {
    const normalized = normalizeHexSafe(value);
    if (!normalized) return;
    const state = this.appStateGetter.current();
    const theme = state.themes.theme;
    const checkedColorRefs = new Set(state.themes.checkedColorRefs);
    if (!theme || checkedColorRefs.size === 0) return;
    const applyToDark = theme.applyPaletteToDark ?? true;
    const applyToLight = theme.applyPaletteToLight ?? true;
    const hueAdjustment = state.themes.hueAdjustment;
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
    this.saveThemeController.run(nextTheme);
  }
}
