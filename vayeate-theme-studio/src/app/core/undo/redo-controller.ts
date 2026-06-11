import { singleton } from 'tsyringe';
import { RedoOperation } from '../../../domain/operations/undo-operations/redo-operation';
import { CloseMenusOperation } from '../../../domain/operations/app-operations/close-menus-operation';
import type { HistoryTransitionResult } from '../../../model/undo-history';

/**
 * Replays one redo step and closes open menus after the history transition.
 */
@singleton()
export class RedoController {
  constructor(
    private readonly performRedo: RedoOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  async run(): Promise<HistoryTransitionResult> {
    const result = await this.performRedo.execute();
    this.closeMenus.execute();
    return result;
  }
}
