import { singleton } from 'tsyringe';
import { LoadAppConfigOperation } from '../../../../domain/operations/app-operations/load-app-config-operation';
import { ClearPersistedUndoOperation } from '../../../../domain/operations/undo-operations/clear-persisted-undo-operation';
import { LoadUndoHistoryOperation } from '../../../../domain/operations/undo-operations/load-undo-history-operation';
import { InitializeWindowCallbacksController } from '../../window/controllers/initialize-window-callbacks-controller';

@singleton()
export class LoadAppController {
  constructor(
    private readonly initializeWindowService: InitializeWindowCallbacksController,
    private readonly loadAppConfig: LoadAppConfigOperation,
    private readonly clearPersistedUndo: ClearPersistedUndoOperation,
    private readonly loadUndoHistory: LoadUndoHistoryOperation
  ) { }

  run(): void {
    this.initializeWindowService.run();
    this.clearPersistedUndo.execute();
    this.loadAppConfig.execute();
    this.loadUndoHistory.execute();
  }
}
