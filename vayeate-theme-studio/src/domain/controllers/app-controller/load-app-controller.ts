import { singleton } from 'tsyringe';
import { InitializeWindowServiceOperation } from '../../operations/app-operations/initialize-window-service-operation';
import { LoadAppConfigOperation } from '../../operations/app-operations/load-app-config-operation';
import { ClearPersistedUndoOperation } from '../../operations/undo-operations/clear-persisted-undo-operation';

@singleton()
export class LoadAppController {
  constructor(
    private readonly clearPersistedUndo: ClearPersistedUndoOperation,
    private readonly loadAppConfig: LoadAppConfigOperation,
    private readonly initializeWindowService: InitializeWindowServiceOperation,
  ) { }
  
  async run(): Promise<void> {
    this.clearPersistedUndo.execute();
    this.loadAppConfig.execute();
    this.initializeWindowService.execute();
  }
}
