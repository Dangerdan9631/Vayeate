import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { createUndoProcessor } from '../../core/undo-processor';
import { emptyUndoMenuSnapshot } from '../../state/undo-stack/undo-stack-state';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import { refreshUndoSummary } from './undo-operation-helpers';

@singleton()
export class LoadUndoHistoryOperation {
  constructor(
    private readonly undoStackStore: UndoStackStore,
  ) {}

  async execute(): Promise<void> {
    const snap = this.undoStackStore.getStore().state;
    if (!snap.currentUndoStackId) {
      this.undoStackStore.getStore().setUndoMenuSnapshot(emptyUndoMenuSnapshot);
      return;
    }
    const processor = createUndoProcessor();
    const stack = await undoManagerV2.getOrCreate(snap.currentUndoStackId, { processor });
    refreshUndoSummary(this.undoStackStore, stack);
  }
}
