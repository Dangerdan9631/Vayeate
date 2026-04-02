import type { AppState } from '../app-state';
import type { UndoStackState } from './undo-stack-state';

export type UndoStackStateUpdate =
  | { type: 'SET_CURRENT_UNDO_STACK_ID'; stackId: string | null }
  | { type: 'SET_UNDO_LIST_VERSION'; value: number };

export function undoStackStateReducer(state: AppState, update: UndoStackStateUpdate): AppState {
  switch (update.type) {
    case 'SET_CURRENT_UNDO_STACK_ID':
      return { ...state, undoStack: { ...state.undoStack, currentUndoStackId: update.stackId } };
    case 'SET_UNDO_LIST_VERSION':
      return { ...state, undoStack: { ...state.undoStack, undoListVersion: update.value } };
    default:
      return state;
  }
}

export type SetUndoStackState = (update: UndoStackStateUpdate) => void;
export class UndoStackStateSetter {
  constructor(private readonly set: SetUndoStackState) { }

  apply(update: UndoStackStateUpdate): void {
    this.set(update);
  }
}

export type GetUndoStackState = () => UndoStackState;
export class UndoStackStateGetter {
  constructor(private readonly get: GetUndoStackState) {}

  current(): UndoStackState {
    return this.get();
  }
}
