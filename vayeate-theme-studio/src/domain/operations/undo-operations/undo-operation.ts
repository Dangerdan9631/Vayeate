import { singleton } from 'tsyringe';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import type { HistoryTransitionResult } from '../../../model/undo-history';
import { getActiveUndoStack, refreshUndoSummary, unavailableResult } from './undo-operation-helpers';

@singleton()
export class UndoOperation {
  constructor(
    private readonly undoStackStore: UndoStackStore,
  ) {}

  async execute(): Promise<HistoryTransitionResult> {
    const active = await getActiveUndoStack(this.undoStackStore);
    if (!active) {
      return unavailableResult('undo', null, 'No undo context is active.');
    }

    const result = await active.stack.undo();
    refreshUndoSummary(this.undoStackStore, active.stack);
    return result;
  }
}
