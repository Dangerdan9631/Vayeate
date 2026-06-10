import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import { deriveUndoBaselineLabel, type UndoContext } from '../../../model/undo-history';
import { BuildUniversalUndoProcessorOperation } from './build-universal-undo-processor-operation';
import { refreshUndoSummary } from './undo-operation-helpers';

@singleton()
export class SetCurrentUndoStackIdOperation {
  constructor(
    private readonly undoStackStore: UndoStackStore,
    private readonly buildUniversalUndoProcessor: BuildUniversalUndoProcessorOperation,
  ) {}

  execute(stackId: string | null): void {
    this.undoStackStore.getStore().setCurrentUndoStackId(stackId);
  }

  executeForContext(context: UndoContext | null): void {
    const store = this.undoStackStore.getStore();
    store.setCurrentUndoStackId(context?.contextKey ?? null);
    store.setCurrentBaselineLabel(context ? deriveUndoBaselineLabel(context) : 'Opened');
  }

  async executeAndLoadForContext(context: UndoContext | null): Promise<void> {
    this.executeForContext(context);

    if (!context) {
      refreshUndoSummary(this.undoStackStore, null);
      return;
    }

    const stack = await undoManagerV2.getOrCreate(context.contextKey, {
      processor: this.buildUniversalUndoProcessor.execute(),
    });
    refreshUndoSummary(this.undoStackStore, stack);
  }
}
