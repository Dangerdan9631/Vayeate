import type { SetState } from '../operations/app-operations';
import type { GetState } from '../operations/undo-operations';
import {
  performUndo as performUndoOp,
  performRedo as performRedoOp,
  performHistoryGoTo as performHistoryGoToOp,
} from '../operations/undo-operations';

export async function performUndo(setState: SetState, getState: GetState): Promise<void> {
  await performUndoOp(setState, getState);
}

export async function performRedo(setState: SetState, getState: GetState): Promise<void> {
  await performRedoOp(setState, getState);
}

export async function performHistoryGoTo(
  setState: SetState,
  getState: GetState,
  frameId: string,
): Promise<void> {
  await performHistoryGoToOp(setState, getState, frameId);
}
