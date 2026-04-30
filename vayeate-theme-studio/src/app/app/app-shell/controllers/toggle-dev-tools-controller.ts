import { singleton } from 'tsyringe';
import { ToggleDevToolsOperation } from '../../../../domain/operations/window-operations/toggle-dev-tools-operation';
import { CloseMenusOperation } from '../../../../domain/operations/app-operations/close-menus-operation';

@singleton()
export class ToggleDevToolsController {
  constructor(
    private readonly toggleDevTools: ToggleDevToolsOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  run(): void {
    this.closeMenus.execute();
    this.toggleDevTools.execute();
  }
}
