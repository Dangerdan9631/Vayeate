import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../../core/Undo/undo-manager-v2';
import { emptyUndoMenuSnapshot } from '../../../state/Undo/undo-stack/undo-stack-state';
import { UndoStackStore } from '../../../state/Undo/undo-stack/undo-stack-store';
import { BuildUniversalUndoProcessorOperation } from '../../Undo/undo-operations/build-universal-undo-processor-operation';
import { refreshUndoSummary } from './undo-operation-helpers';

/**
 * Loads undo history from persistence into the store.
 */

@singleton()
export class LoadUndoHistoryOperation {
  constructor(
    private readonly undoStackStore: UndoStackStore,
    private readonly buildUniversalUndoProcessor: BuildUniversalUndoProcessorOperation,
  ) {}

  /**
   * Runs the load undo history mutation.
   * @returns Promise resolving to void.
   */

  async execute(): Promise<void> {
    const snap = this.undoStackStore.getStore().state;
    if (!snap.currentUndoStackId) {
      this.undoStackStore.getStore().setUndoMenuSnapshot(emptyUndoMenuSnapshot);
      return;
    }
    const processor = this.buildUniversalUndoProcessor.execute();
    const stack = await undoManagerV2.getOrCreate(snap.currentUndoStackId, { processor });
    refreshUndoSummary(this.undoStackStore, stack);
  }
}
