export interface UndoStackState {
  currentUndoStackId: string | null;
  undoListVersion: number;
}

export const initialUndoStackState: UndoStackState = {
  currentUndoStackId: null,
  undoListVersion: 0,
};
