import type { AppState } from '../state/app-state';
import { undoManagerV2 } from '../core/undo-manager-v2';
import { undoManagerV2Service } from '../../gateway/services/undo-manager-v2-service';
import { createUndoProcessor, type SetState } from '../core/undo-processor';

export type GetState = () => AppState;

/** Clear in-memory undo stacks and delete persisted undo files (V2). Single responsibility; invoked by app controller on load/unload. */
export async function clearPersistedUndo(): Promise<void> {
  undoManagerV2.configure({ persistence: undoManagerV2Service });
  await undoManagerV2.clearPersisted();
}

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

export async function performRedo(setState: SetState, getState: GetState): Promise<void> {
  const state = getState();
  const stackId = state.undoStackId.currentUndoStackId;
  if (!stackId) return;
  const processor = createUndoProcessor(setState);
  const stack = await undoManagerV2.getOrCreate(stackId, { processor });
  const didRedo = stack.redo();
  if (didRedo) {
    setState({ type: 'SET_UNDO_LIST_VERSION', value: state.undoStackId.undoListVersion + 1 });
  }
}

export async function performHistoryGoTo(
  setState: SetState,
  getState: GetState,
  frameId: string,
): Promise<void> {
  const state = getState();
  const stackId = state.undoStackId.currentUndoStackId;
  if (!stackId) return;
  const processor = createUndoProcessor(setState);
  const stack = await undoManagerV2.getOrCreate(stackId, { processor });
  const didGoto = stack.goto(frameId);
  if (didGoto) {
    setState({ type: 'SET_UNDO_LIST_VERSION', value: state.undoStackId.undoListVersion + 1 });
  }
}

/** Set the current undo stack ID. Not called from any app code; available for future use (e.g. tab/doc switch). */
export function setCurrentUndoStackId(setState: SetState, stackId: string | null): void {
  setState({ type: 'SET_CURRENT_UNDO_STACK_ID', stackId });
}
