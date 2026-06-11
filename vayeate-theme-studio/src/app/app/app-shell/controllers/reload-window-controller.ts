import { singleton } from 'tsyringe';
import { ReloadWindowOperation } from '../../../../domain/operations/window-operations/reload-window-operation';
import { CloseMenusOperation } from '../../../../domain/operations/app-operations/close-menus-operation';

/**
 * Reloads the renderer window from the View menu without bypassing cache.
 */
@singleton()
export class ReloadWindowController {
  constructor(
    private readonly reloadWindow: ReloadWindowOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  /**
   * Closes open menus and requests a standard window reload.
   */
  run(): void {
    this.closeMenus.execute();
    this.reloadWindow.execute(false);
  }
}
