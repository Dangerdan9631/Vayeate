import {
  setThemePaneSelections as setThemePaneSelectionsOp,
  type SetState,
} from '../../operations/theme-operations';

/** Set full pane selection (color and contrast refs) in one go. */
export function setPaletteFullSelection(
  setState: SetState,
  colorRefs: string[],
  contrastRefs: string[],
): void {
  setThemePaneSelectionsOp(setState, colorRefs, contrastRefs);
}
