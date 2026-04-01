import type { AppState } from '../../state/app-state';

export type GetState = () => AppState;
export { ClearPersistedUndoOperation } from './clear-persisted-undo-operation';
export { PerformUndoOperation } from './perform-undo-operation';
export { PerformRedoOperation } from './perform-redo-operation';
export { PerformHistoryGoToOperation } from './perform-history-go-to-operation';
export { SetCurrentUndoStackIdOperation, setCurrentUndoStackId } from './set-current-undo-stack-id-operation';
