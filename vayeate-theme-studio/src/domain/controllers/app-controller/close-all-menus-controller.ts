import { singleton } from 'tsyringe';
import { CloseMenusOperation } from '../../operations/app-operations/close-menus-operation';

@singleton()
export class CloseAllMenusController {
  constructor(private readonly closeAllMenus: CloseMenusOperation) {}

  async run(): Promise<void> {
    this.closeAllMenus.execute();
  }
}
