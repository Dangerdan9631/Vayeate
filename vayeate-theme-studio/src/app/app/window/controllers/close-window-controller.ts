import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../../../domain/operations/window-operations/set-window-state-operation';
import { CloseMenusOperation } from '../../../../domain/operations/app-operations/close-menus-operation';

/**
 * Closes the application window from shell chrome or the File menu.
 */
@singleton()
export class CloseWindowController {
  constructor(
    private readonly setWindowState: SetWindowStateOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  /**
   * Closes open menus and requests window close through the window service.
   */
  run(): void {
    this.closeMenus.execute();
    this.setWindowState.execute('close');
  }
}
