import type { SetState } from './types';

/** Set the current undo stack ID. Not called from any app code; available for future use (e.g. tab/doc switch). */
export function setCurrentUndoStackId(setState: SetState, stackId: string | null): void {
  setState({ type: 'SET_CURRENT_UNDO_STACK_ID', stackId });
}
