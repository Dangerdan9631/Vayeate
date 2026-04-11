import { singleton } from 'tsyringe';
import { CloseAllMenusOperation } from '../../operations/app-operations/close-all-menus-operation';

@singleton()
export class CloseAllMenusController {
  constructor(private readonly closeAllMenus: CloseAllMenusOperation) {}

  async run(): Promise<void> {
    this.closeAllMenus.execute();
  }
}
