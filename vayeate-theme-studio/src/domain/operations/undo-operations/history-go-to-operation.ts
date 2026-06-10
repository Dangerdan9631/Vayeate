import { singleton } from 'tsyringe';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import type { HistoryTransitionResult } from '../../../model/undo-history';
import { getActiveUndoStack, refreshUndoSummary, unavailableResult } from './undo-operation-helpers';

@singleton()
export class HistoryGoToOperation {
  constructor(
    private readonly undoStackStore: UndoStackStore,
  ) {}

  async execute(frameId: string): Promise<HistoryTransitionResult> {
    const active = await getActiveUndoStack(this.undoStackStore);
    if (!active) {
      return unavailableResult('go-to', null, 'No undo context is active.');
    }

    const result = await active.stack.goto(frameId);
    refreshUndoSummary(this.undoStackStore, active.stack);
    return result;
  }
}
