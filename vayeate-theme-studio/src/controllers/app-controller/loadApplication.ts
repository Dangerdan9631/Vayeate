import type { SetState } from '../../operations/app-operations';
import {
  loadApplication as loadApplicationOp,
} from '../../operations/app-operations';
import { clearPersistedUndo } from '../../operations/undo-operations';

/** Application bootstrap: compose operations (load application stub, clear persisted undo). */
export async function loadApplication(setState: SetState): Promise<void> {
  await loadApplicationOp(setState);
  await clearPersistedUndo();
}
