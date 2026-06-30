import type { TabId } from '../../../model/app-ui';
import type { UndoAvailabilitySummary, UndoContext } from '../../../model/undo-history';

/**
 * Undo menu presentation fields derived from availability summary plus navigation metadata.
 */
export interface UndoMenuSnapshot extends UndoAvailabilitySummary {
  frames: UndoAvailabilitySummary['recentActions'];
  currentId: string | null;
  baselineLabel: string;
}

/**
 * Default undo menu snapshot used before history is loaded or when no stack is active.
 */
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

/**
 * Domain state for the active undo stack, menu snapshot, and per-tab undo context.
 */
export interface UndoStackState {
  currentUndoStackId: string | null;
  currentBaselineLabel: string;
  undoListVersion: number;
  undoMenu: UndoMenuSnapshot;
  lastContextByTab: Partial<Record<TabId, UndoContext>>;
}

/**
 * Initial undo stack state before a stack is selected or history is hydrated.
 */
export const initialUndoStackState: UndoStackState = {
  currentUndoStackId: null,
  currentBaselineLabel: 'Opened',
  undoListVersion: 0,
  undoMenu: emptyUndoMenuSnapshot,
  lastContextByTab: {},
};
