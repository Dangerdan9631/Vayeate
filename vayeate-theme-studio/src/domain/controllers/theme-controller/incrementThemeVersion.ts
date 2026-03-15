import type { Theme } from '../../../model/schemas';
import { nextPatchVersion } from '../../utils/version';
import type { SetStoreState } from '../../state/store-state-reducer';
import {
  setSelectedThemeRef,
  setThemeHueAdjustment as setThemeHueAdjustmentOp,
  setThemeSaveError,
  setThemePaneSelections as setThemePaneSelectionsOp,
  saveTheme as saveThemeOp,
  loadTheme,
  loadThemeRefs as loadThemeRefsOp,
  type SetState,
} from '../../operations/theme-operations';
import { setCurrentUndoStackId, type GetState } from '../../operations/undo-operations';
import { clearPendingSave } from './theme-save-state';
import { themeStackId } from './themeStackId';

export async function incrementThemeVersion(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
): Promise<void> {
  const state = getState();
  const theme = state.themes.theme;
  if (!theme) return;
  const newVersion = nextPatchVersion(theme.version);
  const bumped: Theme = { ...theme, version: newVersion };
  clearPendingSave();
  setThemeHueAdjustmentOp(setState, 0);
  try {
    await saveThemeOp(bumped);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    setThemeSaveError(setState, message);
    return;
  }
  await loadThemeRefsOp(setState, setStoreState);
  setSelectedThemeRef(setState, { name: theme.name, version: newVersion });
  const loaded = await loadTheme(setState, theme.name, newVersion);
  if (loaded) {
    setThemePaneSelectionsOp(
      setState,
      loaded.colorAssignments.map((a) => a.colorRef),
      loaded.contrastAssignments.map((a) => a.contrastVariableRef),
    );
  }
  setCurrentUndoStackId(setState, themeStackId(theme.name, newVersion));
}
