import type { SetState } from '../../operations/app-operations';
import { unloadApplication as unloadApplicationOp } from '../../operations/app-operations';

/** Application teardown: compose operations (unload application stub, clear persisted undo). */
export async function unloadApplication(setState: SetState): Promise<void> {
  await unloadApplicationOp(setState);
  // Leave this step commented out for debugging. It should be added back when done developing undo.
  //await clearPersistedUndo();
}
