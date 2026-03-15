import { undoManagerV2 } from '../../core/undo-manager-v2';
import { createUndoProcessor } from '../../core/undo-processor';
import type { GetState, SetState } from './types';

export async function performUndo(setState: SetState, getState: GetState): Promise<void> {
  const state = getState();
  const stackId = state.undoStackId.currentUndoStackId;
  if (!stackId) return;
  const processor = createUndoProcessor(setState);
  const stack = await undoManagerV2.getOrCreate(stackId, { processor });
  const didUndo = stack.undo();
  if (didUndo) {
    setState({ type: 'SET_UNDO_LIST_VERSION', value: state.undoStackId.undoListVersion + 1 });
  }
}
