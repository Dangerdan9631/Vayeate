import type { Theme } from '../../../model/schemas';
import {
  setTheme,
  setThemeHueAdjustment as setThemeHueAdjustmentOp,
  type SetState,
} from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { normalizeHexForPalette, applyHueToAssignmentsFiltered } from './_helpers';
import { saveTheme } from './saveTheme';

export function commitAssignColorText(
  setState: SetState,
  getState: GetState,
  value: string,
): void {
  const normalized = normalizeHexForPalette(value);
  if (!normalized) return;
  const state = getState();
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
  setThemeHueAdjustmentOp(setState, 0);
  setTheme(setState, nextTheme);
  saveTheme(setState, nextTheme);
}
