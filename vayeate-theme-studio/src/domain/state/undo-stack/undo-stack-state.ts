/** Current undo stack ID for the history menu; null when no stack is active. */
export interface UndoStackState {
  currentUndoStackId: string | null;
  /** Bump to trigger history list refetch after undo/redo/goto. */
  undoListVersion: number;
}

export const initialUndoStackState: UndoStackState = {
  currentUndoStackId: null,
  undoListVersion: 0,
};
