import { singleton } from 'tsyringe';
import { SyncUndoMenuStateOperation } from '../../operations/undo-operations/sync-undo-menu-state-operation';

@singleton()
export class SyncUndoMenuStateController {
  constructor(private readonly syncUndoMenuState: SyncUndoMenuStateOperation) {}

  async run(): Promise<void> {
    await this.syncUndoMenuState.execute();
  }
}
