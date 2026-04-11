import { singleton } from 'tsyringe';
import { UndoStackStateSetter } from '../../state/undo-stack/undo-stack-state-reducer';

@singleton()
export class SetCurrentUndoStackIdOperation {
  constructor(private readonly undoStackStateSetter: UndoStackStateSetter) {}

  execute(stackId: string | null): void {
    this.undoStackStateSetter.apply({ type: 'SET_CURRENT_UNDO_STACK_ID', stackId });
  }
}
