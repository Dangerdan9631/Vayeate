import { singleton } from 'tsyringe';
import { HistoryGoToOperation } from '../../../domain/operations/undo-operations/history-go-to-operation';
import { CloseMenusOperation } from '../../../domain/operations/app-operations/close-menus-operation';

@singleton()
export class HistoryGoToController {
  constructor(
    private readonly performHistoryGoTo: HistoryGoToOperation,
    private readonly closeMenus: CloseMenusOperation,
  ) {}

  run(frameId: string): void {
    this.performHistoryGoTo.execute(frameId);
    this.closeMenus.execute();
  }
}
