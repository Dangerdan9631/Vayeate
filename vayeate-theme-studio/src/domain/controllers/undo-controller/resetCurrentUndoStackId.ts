import { setCurrentUndoStackId, type SetState } from '../../operations/undo-operations';

/** Reset the current undo stack ID (e.g. on page navigation). */
export function resetCurrentUndoStackId(setState: SetState): void {
  setCurrentUndoStackId(setState, null);
}
