import type { AppState } from '../../state/app-state';

export type GetState = () => AppState;
export { ClearPersistedUndo } from './clearPersistedUndo';
export { PerformUndo } from './performUndo';
export { PerformRedo } from './performRedo';
export { PerformHistoryGoTo } from './performHistoryGoTo';
export { SetCurrentUndoStackId, setCurrentUndoStackId } from './setCurrentUndoStackId';
