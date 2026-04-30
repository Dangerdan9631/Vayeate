import { singleton } from 'tsyringe';
import { InitializeWindowCallbacksOperation } from '../../../../domain/operations/app-operations/initialize-window-callbacks-operation';
import { LoadAppConfigOperation } from '../../../../domain/operations/app-operations/load-app-config-operation';
import { ClearPersistedUndoOperation } from '../../../../domain/operations/undo-operations/clear-persisted-undo-operation';
import { LoadUndoHistoryOperation } from '../../../../domain/operations/undo-operations/load-undo-history-operation';

@singleton()
export class LoadAppController {
  constructor(
    private readonly initializeWindowService: InitializeWindowCallbacksOperation,
    private readonly loadAppConfig: LoadAppConfigOperation,
    private readonly clearPersistedUndo: ClearPersistedUndoOperation,
    private readonly loadUndoHistory: LoadUndoHistoryOperation
  ) { }

  run(): void {
    this.initializeWindowService.execute();
    this.clearPersistedUndo.execute();
    this.loadAppConfig.execute();
    this.loadUndoHistory.execute();
  }
}
