import { singleton } from 'tsyringe';
import { UndoOperation } from '../../../domain/operations/undo-operations/undo-operation';
import { CloseMenusOperation } from '../../../domain/operations/app-operations/close-menus-operation';

@singleton()
export class UndoController {
  constructor(
    private readonly performUndo: UndoOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  run(): void {
    this.performUndo.execute();
    this.closeMenus.execute();
  }
}
