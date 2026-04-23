import { singleton } from 'tsyringe';
import { CloseMenusOperation } from '../../../../../domain/operations/app-operations/close-menus-operation';

@singleton()
export class CloseAllMenusController {
  constructor(private readonly closeAllMenus: CloseMenusOperation) {}

  run(): void {
    this.closeAllMenus.execute();
  }
}
