import type { UndoAvailabilitySummary } from '../../../model/undo-history';

export interface UndoMenuSnapshot extends UndoAvailabilitySummary {
  frames: UndoAvailabilitySummary['recentActions'];
  currentId: string | null;
  baselineLabel: string;
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
  baselineLabel: 'Opened',
  historyVersion: 0,
};

export interface UndoStackState {
  currentUndoStackId: string | null;
  currentBaselineLabel: string;
  undoListVersion: number;
  undoMenu: UndoMenuSnapshot;
}

export const initialUndoStackState: UndoStackState = {
  currentUndoStackId: null,
  currentBaselineLabel: 'Opened',
  undoListVersion: 0,
  undoMenu: emptyUndoMenuSnapshot,
};

