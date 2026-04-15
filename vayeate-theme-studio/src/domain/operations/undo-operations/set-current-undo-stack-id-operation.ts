import { singleton } from 'tsyringe';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';

@singleton()
export class SetCurrentUndoStackIdOperation {
  constructor(private readonly undoStackStore: UndoStackStore) {}

  execute(stackId: string | null): void {
    this.undoStackStore.getStore().setCurrentUndoStackId(stackId);
  }
}
