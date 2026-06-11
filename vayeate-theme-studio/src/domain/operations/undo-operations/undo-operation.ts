import { singleton } from 'tsyringe';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import type { HistoryTransitionResult } from '../../../model/undo-history';
import { BuildUniversalUndoProcessorOperation } from './build-universal-undo-processor-operation';
import { getActiveUndoStack, refreshUndoSummary, unavailableResult } from './undo-operation-helpers';

/**
 * Replays one undo step on the active undo stack.
 */

@singleton()
export class UndoOperation {
  constructor(
    private readonly undoStackStore: UndoStackStore,
    private readonly buildUniversalUndoProcessor: BuildUniversalUndoProcessorOperation,
  ) {}

  /**
   * Runs the undo mutation.
   * @returns Promise resolving to HistoryTransitionResult.
   */

  async execute(): Promise<HistoryTransitionResult> {
    const active = await getActiveUndoStack(
      this.undoStackStore,
      this.buildUniversalUndoProcessor.execute(),
    );
    if (!active) {
      return unavailableResult('undo', null, 'No undo context is active.');
    }

    const result = await active.stack.undo();
    refreshUndoSummary(this.undoStackStore, active.stack);
    return result;
  }
}
