import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../state/app-state-setter';
import type { AppStateUpdate } from '../../state/app-state';

/** Set the current undo stack ID. */
@singleton()
export class SetCurrentUndoStackId {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(stackId: string | null): void {
    this.appStateSetter.apply({ type: 'SET_CURRENT_UNDO_STACK_ID', stackId });
  }
}

/** @deprecated Use SetCurrentUndoStackId class instead. Kept for backward compat with function-based callers. */
export function setCurrentUndoStackId(setState: (update: AppStateUpdate) => void, stackId: string | null): void {
  setState({ type: 'SET_CURRENT_UNDO_STACK_ID', stackId });
}
