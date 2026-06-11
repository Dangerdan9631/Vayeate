import { singleton } from 'tsyringe';
import { HistoryGoToOperation } from '../../../domain/operations/undo-operations/history-go-to-operation';
import { CloseMenusOperation } from '../../../domain/operations/app-operations/close-menus-operation';
import type { HistoryTransitionResult } from '../../../model/undo-history';

/**
 * Jumps the undo history to a specific frame and closes open menus after the transition.
 */
@singleton()
export class HistoryGoToController {
  constructor(
    private readonly performHistoryGoTo: HistoryGoToOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  async run(frameId: string): Promise<HistoryTransitionResult> {
    const result = await this.performHistoryGoTo.execute(frameId);
    this.closeMenus.execute();
    return result;
  }
}
