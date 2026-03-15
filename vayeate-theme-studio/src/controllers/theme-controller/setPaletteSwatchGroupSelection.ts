import {
  setThemePaneSelections as setThemePaneSelectionsOp,
  type SetState,
} from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';

export function setPaletteSwatchGroupSelection(
  setState: SetState,
  getState: GetState,
  refs: string[],
  checked: boolean,
): void {
  const state = getState();
  const currentColor = state.themes.checkedColorRefs;
  const nextSet = new Set(currentColor);
  for (const r of refs) {
    if (checked) nextSet.add(r);
    else nextSet.delete(r);
  }
  setThemePaneSelectionsOp(setState, [...nextSet], state.themes.checkedContrastRefs);
}
