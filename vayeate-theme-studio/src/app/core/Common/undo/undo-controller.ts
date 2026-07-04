import { singleton } from 'tsyringe';
import { UndoOperation } from '../../../../domain/operations/Common/undo-operations/undo-operation';
import { CloseMenusOperation } from '../../../../domain/operations/Common/app-operations/close-menus-operation';
import type { HistoryTransitionResult } from '../../../../model/Common/undo-history';

/**
 * Replays one undo step and closes open menus after the history transition.
 */
@singleton()
export class UndoController {
  constructor(
    private readonly performUndo: UndoOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  async run(): Promise<HistoryTransitionResult> {
    const result = await this.performUndo.execute();
    this.closeMenus.execute();
    return result;
  }
}
