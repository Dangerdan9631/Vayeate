import type { SetState } from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { setPaletteSwatchGroupSelection } from './setPaletteSwatchGroupSelection';

/** Add ref to selection (member swatch click). */
export function setPaletteMemberSwatch(
  setState: SetState,
  getState: GetState,
  ref: string | undefined,
): void {
  if (ref == null) return;
  setPaletteSwatchGroupSelection(setState, getState, [ref], true);
}
