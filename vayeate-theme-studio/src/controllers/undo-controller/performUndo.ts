import type { SetState } from '../../operations/app-operations';
import type { GetState } from '../../operations/undo-operations';
import { performUndo as performUndoOp } from '../../operations/undo-operations';

export async function performUndo(setState: SetState, getState: GetState): Promise<void> {
  await performUndoOp(setState, getState);
}
