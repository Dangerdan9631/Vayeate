import type { UndoListEntry } from '../../core/undo-manager-v2';

/** Snapshot of undo stack list + capabilities for the menu bar (synced from IPC by operations). */
export interface UndoMenuSnapshot {
  frames: UndoListEntry[];
  currentId: string | null;
  canUndo: boolean;
  canRedo: boolean;
}

export const emptyUndoMenuSnapshot: UndoMenuSnapshot = {
  frames: [],
  currentId: null,
  canUndo: false,
  canRedo: false,
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
