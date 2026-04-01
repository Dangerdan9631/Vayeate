import { singleton } from 'tsyringe';
import { CloseAllMenusOperation } from '../../operations/app-operations';

@singleton()
export class CloseAllMenusController {
  constructor(private readonly closeAllMenus: CloseAllMenusOperation) {}

  run(): void {
    this.closeAllMenus.execute();
  }
}
