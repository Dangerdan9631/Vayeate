import { compareVersions } from '../../../utils/version';
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
import { themeStackId } from './themeStackId';

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

  const sameThName = refs
    .filter((r) => r.name === name)
    .sort((a, b) => compareVersions(a.version, b.version));
  const lowerTh = sameThName.filter((r) => compareVersions(r.version, version) < 0);
  const higherTh = sameThName.filter((r) => compareVersions(r.version, version) > 0);
  const nextTh =
    lowerTh.length > 0 ? lowerTh[lowerTh.length - 1] : higherTh.length > 0 ? higherTh[0] : null;

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

