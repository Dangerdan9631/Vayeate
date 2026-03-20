import type { SetStoreState } from '../../../state/store-state-reducer';
import {
  createTheme as createThemeOperation,
  loadThemeRefs as loadThemeRefsOp,
  setTheme,
  setSelectedThemeRef,
  setThemeCreateFormName,
  setThemePaneSelections as setThemePaneSelectionsOp,
  type SetState,
} from '../../../operations/theme-operations';
import { setCurrentUndoStackId } from '../../../operations/undo-operations';
import { themeStackId } from '../../../utils/stack-id';

export async function createTheme(
  setState: SetState,
  setStoreState: SetStoreState,
  params: { name: string },
): Promise<void> {
  setState({ type: 'SET_THEME_IS_CREATING', value: true });
  setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
  setThemeCreateFormName(setState, '');
  try {
    const newTheme = await createThemeOperation(setState, params);
    await loadThemeRefsOp(setState, setStoreState);
    setTheme(setState, newTheme);
    setSelectedThemeRef(setState, { name: newTheme.name, version: newTheme.version });
    setThemePaneSelectionsOp(
      setState,
      newTheme.colorAssignments.map((a) => a.colorRef),
      newTheme.contrastAssignments.map((a) => a.contrastVariableRef),
    );
    setCurrentUndoStackId(setState, themeStackId(newTheme.name, newTheme.version));
  } finally {
    setState({ type: 'SET_THEME_IS_CREATING', value: false });
  }
}

