import {
  setTheme,
  setSelectedThemeRef,
  setThemePaneSelections as setThemePaneSelectionsOp,
  setThemeHueAdjustment as setThemeHueAdjustmentOp,
  setThemeHueReferenceHex as setThemeHueReferenceHexOp,
  setThemeSaveError,
  saveTheme as saveThemeOp,
  deleteTheme as deleteThemeOp,
  loadThemeRefs as loadThemeRefsOp,
  type SetState,
  type RestoreThemeStateParams,
} from '../../operations/theme-operations';
import { clearPendingSave } from './theme-save-state';

export async function restoreThemeState(
  setState: SetState,
  params: RestoreThemeStateParams,
): Promise<void> {
  if (params.theme !== undefined && params.theme !== null) {
    clearPendingSave();
  }
  if (params.theme !== undefined) {
    setTheme(setState, params.theme);
  }
  if (
    params.checkedColorRefs !== undefined &&
    params.checkedContrastRefs !== undefined
  ) {
    setThemePaneSelectionsOp(setState, params.checkedColorRefs, params.checkedContrastRefs);
  }
  if (params.theme !== undefined && params.theme !== null) {
    setSelectedThemeRef(setState, {
      name: params.theme.name,
      version: params.theme.version,
    });
  }
  if (params.hueAdjustment !== undefined) {
    setThemeHueAdjustmentOp(setState, params.hueAdjustment);
  }
  if (params.hueReferenceHex !== undefined) {
    setThemeHueReferenceHexOp(setState, params.hueReferenceHex);
  }
  if (params.theme !== undefined && params.theme !== null) {
    setThemeSaveError(setState, null);
    try {
      await saveThemeOp(params.theme);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setThemeSaveError(setState, message);
    }
    await loadThemeRefsOp(setState);
  }
  if (params.deleteThemeVersionOnRestore) {
    await deleteThemeOp(
      params.deleteThemeVersionOnRestore.name,
      params.deleteThemeVersionOnRestore.version,
    );
    await loadThemeRefsOp(setState);
  }
}
