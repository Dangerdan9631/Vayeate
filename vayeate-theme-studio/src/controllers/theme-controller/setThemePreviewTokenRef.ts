import type { Theme } from '../../model/schemas';
import {
  setTheme,
  setThemeHueReferenceHex as setThemeHueReferenceHexOp,
  setThemeHueAdjustment as setThemeHueAdjustmentOp,
  type SetState,
} from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import type { ThemePreviewTokenRefField } from '../../app/actions/action-types';
import { applyHueShift } from '../../core/color';
import { saveTheme } from './saveTheme';

/** Set a preview token ref field (THEME_DETAILS_PREVIEW_TOKEN_REF_LIST_ON_COMMIT). Updates theme, saves, recenters hue. */
export function setThemePreviewTokenRef(
  setState: SetState,
  getState: GetState,
  tokenRefField: ThemePreviewTokenRefField,
  value: string | null,
): void {
  const theme = getState().themes.theme;
  if (!theme) return;
  const next: Theme = { ...theme, [tokenRefField]: value };
  setTheme(setState, next);
  saveTheme(setState, next);
  const state = getState();
  const hueRef = state.themes.hueReferenceHex ?? '';
  const hueAdjustment = state.themes.hueAdjustment ?? 0;
  const nextRefHex = applyHueShift(hueRef, hueAdjustment / 100);
  setThemeHueReferenceHexOp(setState, nextRefHex);
  setThemeHueAdjustmentOp(setState, 0);
}
