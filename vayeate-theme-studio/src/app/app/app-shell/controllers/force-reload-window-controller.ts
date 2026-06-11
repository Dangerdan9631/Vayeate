import { singleton } from 'tsyringe';
import { ReloadWindowOperation } from '../../../../domain/operations/window-operations/reload-window-operation';
import { CloseMenusOperation } from '../../../../domain/operations/app-operations/close-menus-operation';

/**
 * Force-reloads the renderer window from the View menu, bypassing cache.
 */
@singleton()
export class ForceReloadWindowController {
  constructor(
    private readonly reloadWindow: ReloadWindowOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  /**
   * Closes open menus and requests a hard window reload.
   */
  run(): void {
    this.closeMenus.execute();
    this.reloadWindow.execute(true);
  }
}
