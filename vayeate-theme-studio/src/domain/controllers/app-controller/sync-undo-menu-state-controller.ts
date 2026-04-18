import { singleton } from 'tsyringe';
import { LoadUndoHistoryOperation } from '../../operations/undo-operations/sync-undo-menu-state-operation';

@singleton()
export class LoadUndoHistoryController {
  constructor(private readonly loadUndoHistory: LoadUndoHistoryOperation) {}

  async run(): Promise<void> {
    await this.loadUndoHistory.execute();
  }
}
