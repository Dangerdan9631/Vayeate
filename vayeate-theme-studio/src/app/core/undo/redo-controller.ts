import { singleton } from 'tsyringe';
import { RedoOperation } from '../../../domain/operations/undo-operations/redo-operation';
import { CloseMenusOperation } from '../../../domain/operations/app-operations/close-menus-operation';

@singleton()
export class RedoController {
  constructor(
    private readonly performRedo: RedoOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  run(): void {
    this.performRedo.execute();
    this.closeMenus.execute();
  }
}
