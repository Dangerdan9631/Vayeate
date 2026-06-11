import { singleton } from 'tsyringe';
import { CloseMenusOperation } from '../../../../domain/operations/app-operations/close-menus-operation';

/**
 * Closes all open header dropdown menus.
 */
@singleton()
export class CloseAllMenusController {
  constructor(private readonly closeAllMenus: CloseMenusOperation) {}

  /**
   * Clears the active menu id from UI state.
   */
  run(): void {
    this.closeAllMenus.execute();
  }
}
