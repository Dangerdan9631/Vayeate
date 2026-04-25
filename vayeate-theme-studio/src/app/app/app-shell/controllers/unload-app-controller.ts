import { singleton } from 'tsyringe';
import { TearDownWindowServiceOperation } from '../../../../domain/operations/app-operations/tear-down-window-service-operation';

@singleton()
export class UnloadAppController {
  constructor(
    private readonly tearDownWindowService: TearDownWindowServiceOperation,
  ) { }
  run(): void {
    this.tearDownWindowService.execute();
    // TODO: Uncomment this when undo is implemented
    // void this.clearPersistedUndo.execute();
  }
}
