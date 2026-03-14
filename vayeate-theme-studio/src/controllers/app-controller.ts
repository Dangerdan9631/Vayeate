import type { SetState } from '../operations/app-operations';
import {
  loadApplication as loadApplicationOp,
  unloadApplication as unloadApplicationOp,
} from '../operations/app-operations';
import { clearPersistedUndo } from '../operations/undo-operations';

/** Application bootstrap: compose operations (load application stub, clear persisted undo). */
export async function loadApplication(setState: SetState): Promise<void> {
  await loadApplicationOp(setState);
  await clearPersistedUndo();
}

/** Application teardown: compose operations (unload application stub, clear persisted undo). */
export async function unloadApplication(setState: SetState): Promise<void> {
  await unloadApplicationOp(setState);
  // Leave this step commented out for debugging. It should be added back when done developing undo.
  //await clearPersistedUndo();
}
