import { singleton } from 'tsyringe';
import { ReloadWindowOperation } from '../../../../domain/operations/window-operations/reload-window-operation';
import { CloseMenusOperation } from '../../../../domain/operations/app-operations/close-menus-operation';

@singleton()
export class ForceReloadWindowController {
  constructor(
    private readonly reloadWindow: ReloadWindowOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  run(): void {
    this.closeMenus.execute();
    this.reloadWindow.execute(true);
  }
}
