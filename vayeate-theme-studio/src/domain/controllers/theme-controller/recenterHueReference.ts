import type { Theme } from '../../../model/schemas';
import {
  setTheme,
  setThemeHueAdjustment as setThemeHueAdjustmentOp,
  type SetState,
} from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { applyHueToAssignmentsFiltered } from './_helpers';
import { saveTheme } from './saveTheme';

export function recenterHueReference(setState: SetState, getState: GetState): void {
  const state = getState();
  const theme = state.themes.theme;
  const hueAdjustment = state.themes.hueAdjustment;
  if (!theme || hueAdjustment === 0) {
    setThemeHueAdjustmentOp(setState, 0);
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
  setTheme(setState, nextTheme);
  saveTheme(setState, nextTheme);
  setThemeHueAdjustmentOp(setState, 0);
}
