import { singleton } from 'tsyringe';
import { SetWindowStateOperation } from '../../../../domain/operations/window-operations/set-window-state-operation';
import { CloseMenusOperation } from '../../../../domain/operations/app-operations/close-menus-operation';

@singleton()
export class CloseWindowController {
  constructor(
    private readonly setWindowState: SetWindowStateOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  run(): void {
    this.closeMenus.execute();
    this.setWindowState.execute('close');
  }
}
