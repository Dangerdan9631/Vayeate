import { singleton } from 'tsyringe';
import { UndoStackStore } from '../../../state/Undo/undo-stack/undo-stack-store';
import type { HistoryTransitionResult } from '../../../../model/Undo/undo-history';
import { BuildUniversalUndoProcessorOperation } from '../../Undo/undo-operations/build-universal-undo-processor-operation';
import { getActiveUndoStack, refreshUndoSummary, unavailableResult } from './undo-operation-helpers';

/**
 * Jumps the undo history to a specific frame.
 */

@singleton()
export class HistoryGoToOperation {
  constructor(
    private readonly undoStackStore: UndoStackStore,
    private readonly buildUniversalUndoProcessor: BuildUniversalUndoProcessorOperation,
  ) {}

  /**
   * Runs the history go to mutation.
   * @param frameId Frame id (string).
   * @returns Promise resolving to HistoryTransitionResult.
   */

  async execute(frameId: string): Promise<HistoryTransitionResult> {
    const active = await getActiveUndoStack(
      this.undoStackStore,
      this.buildUniversalUndoProcessor.execute(),
    );
    if (!active) {
      return unavailableResult('go-to', null, 'No undo context is active.');
    }

    const result = await active.stack.goto(frameId);
    refreshUndoSummary(this.undoStackStore, active.stack);
    return result;
  }
}
