import { singleton } from 'tsyringe';
import { CloseAllMenus } from '../../operations/app-operations';

@singleton()
export class CloseAllMenusController {
  constructor(private readonly closeAllMenus: CloseAllMenus) {}

  run(): void {
    this.closeAllMenus.execute();
  }
}
