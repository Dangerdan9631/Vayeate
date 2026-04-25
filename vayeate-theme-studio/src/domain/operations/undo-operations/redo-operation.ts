import { singleton } from 'tsyringe';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import { undoManagerV2 } from '../../core/undo-manager-v2';

@singleton()
export class RedoOperation {
  constructor(
    private readonly undoStackStore: UndoStackStore,
  ) {}

  async execute(): Promise<void> {
    const snap = this.undoStackStore.getStore().state;
    const stackId = snap.currentUndoStackId;
    if (!stackId) return;
    const stack = await undoManagerV2.getOrCreate(stackId);
    stack.redo();
    this.undoStackStore.getStore().setUndoListVersion(snap.undoListVersion + 1);
  }
}
