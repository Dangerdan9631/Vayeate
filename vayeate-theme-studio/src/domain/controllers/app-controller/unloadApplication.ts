import { singleton } from 'tsyringe';
import { UnloadApplication } from '../../operations/app-operations';

/** Application teardown: compose operations (unload application stub, clear persisted undo). */
@singleton()
export class UnloadApplicationController {
  constructor(private readonly unloadApplication: UnloadApplication) {}

  async run(): Promise<void> {
    await this.unloadApplication.execute();
    // Leave this step commented out for debugging. It should be added back when done developing undo.
    //await clearPersistedUndo();
  }
}
