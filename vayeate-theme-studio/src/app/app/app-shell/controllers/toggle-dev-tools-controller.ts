import { singleton } from 'tsyringe';
import { ToggleDevToolsOperation } from '../../../../domain/operations/window-operations/toggle-dev-tools-operation';
import { CloseMenusOperation } from '../../../../domain/operations/app-operations/close-menus-operation';

/**
 * Toggles Electron developer tools from the View menu.
 */
@singleton()
export class ToggleDevToolsController {
  constructor(
    private readonly toggleDevTools: ToggleDevToolsOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  /**
   * Closes open menus and toggles devtools visibility for the main window.
   */
  run(): void {
    this.closeMenus.execute();
    this.toggleDevTools.execute();
  }
}
