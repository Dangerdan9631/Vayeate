import type { SetState } from '../../../operations/theme-operations';
import type { GetState } from '../../../operations/undo-operations';
import { commitAssignColorText } from './commitAssignColorText';

export function assignColorFromPicker(
  setState: SetState,
  getState: GetState,
  hex: string,
  _ref?: string,
): void {
  commitAssignColorText(setState, getState, hex);
}

