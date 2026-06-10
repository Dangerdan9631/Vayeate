import { singleton } from 'tsyringe';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { createUndoProcessor } from '../../core/undo-processor';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import type { UndoContext } from '../../../model/undo-history';
import { refreshUndoSummary } from './undo-operation-helpers';

@singleton()
export class SetCurrentUndoStackIdOperation {
  constructor(private readonly undoStackStore: UndoStackStore) {}

  execute(stackId: string | null): void {
    this.undoStackStore.getStore().setCurrentUndoStackId(stackId);
  }

  executeForContext(context: UndoContext | null): void {
    this.undoStackStore.getStore().setCurrentUndoStackId(context?.contextKey ?? null);
  }

  async executeAndLoadForContext(context: UndoContext | null): Promise<void> {
    this.executeForContext(context);

    if (!context) {
      refreshUndoSummary(this.undoStackStore, null);
      return;
    }

    const stack = await undoManagerV2.getOrCreate(context.contextKey, {
      processor: createUndoProcessor(),
    });
    refreshUndoSummary(this.undoStackStore, stack);
  }
}
