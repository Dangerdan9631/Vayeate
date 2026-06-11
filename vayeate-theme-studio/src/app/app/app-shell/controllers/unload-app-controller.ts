import { singleton } from 'tsyringe';
import { TearDownWindowServiceOperation } from '../../../../domain/operations/app-operations/tear-down-window-service-operation';

/**
 * Tears down window service listeners when the shell unloads.
 */
@singleton()
export class UnloadAppController {
  constructor(
    private readonly tearDownWindowService: TearDownWindowServiceOperation,
  ) { }

  /**
   * Runs shutdown cleanup for Electron window integration.
   */
  run(): void {
    this.tearDownWindowService.execute();
    // TODO: Uncomment this when undo is implemented
    // void this.clearPersistedUndo.execute();
  }
}
