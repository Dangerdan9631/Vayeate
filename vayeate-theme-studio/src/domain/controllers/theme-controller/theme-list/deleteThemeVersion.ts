import { findNearestVersionRef } from '../../../utils/version';
import { themeStackId } from '../../../utils/stack-id';
import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  deleteTheme as deleteThemeOp,
  setSelectedThemeRef,
  setTheme,
  setThemePaneSelections as setThemePaneSelectionsOp,
  loadTheme,
  loadThemeRefs as loadThemeRefsOp,
  getThemeRefs,
  type SetState,
} from '../../../operations/theme-operations';
import { setCurrentUndoStackId, type GetState } from '../../../operations/undo-operations';

export async function deleteThemeVersion(
  setState: SetState,
  setStoreState: SetStoreState,
  getState: GetState,
  name: string,
  version: string,
): Promise<void> {
  await deleteThemeOp(name, version);
  await loadThemeRefsOp(setState, setStoreState);
  const refs = getThemeRefs(getState);
  const nextTh = findNearestVersionRef(refs, name, version);

  if (nextTh) {
    setSelectedThemeRef(setState, nextTh);
    const loadedNextTh = await loadTheme(setState, nextTh.name, nextTh.version);
    if (loadedNextTh) {
      setThemePaneSelectionsOp(
        setState,
        loadedNextTh.colorAssignments.map((a) => a.colorRef),
        loadedNextTh.contrastAssignments.map((a) => a.contrastVariableRef),
      );
    }
    setCurrentUndoStackId(setState, themeStackId(nextTh.name, nextTh.version));
  } else {
    setSelectedThemeRef(setState, null);
    setTheme(setState, null);
    setThemePaneSelectionsOp(setState, [], []);
    setCurrentUndoStackId(setState, null);
  }
}

