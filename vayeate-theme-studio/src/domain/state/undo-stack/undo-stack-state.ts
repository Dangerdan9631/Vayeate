import type { UndoAvailabilitySummary } from '../../../model/undo-history';

export interface UndoMenuSnapshot extends UndoAvailabilitySummary {
  frames: UndoAvailabilitySummary['recentActions'];
  currentId: string | null;
}

export const emptyUndoMenuSnapshot: UndoMenuSnapshot = {
  activeContextKey: null,
  canUndo: false,
  canRedo: false,
  nextUndoDescription: null,
  nextRedoDescription: null,
  recentActions: [],
  frames: [],
  currentId: null,
  historyVersion: 0,
};

export interface UndoStackState {
  currentUndoStackId: string | null;
  undoListVersion: number;
  undoMenu: UndoMenuSnapshot;
}

export const initialUndoStackState: UndoStackState = {
  currentUndoStackId: null,
  undoListVersion: 0,
  undoMenu: emptyUndoMenuSnapshot,
};

