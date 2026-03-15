import { undoManagerV2 } from '../../core/undo-manager-v2';
import { undoManagerV2Service } from '../../../gateway/services/undo-manager-v2-service';

/** Clear in-memory undo stacks and delete persisted undo files (V2). Single responsibility; invoked by app controller on load/unload. */
export async function clearPersistedUndo(): Promise<void> {
  undoManagerV2.configure({ persistence: undoManagerV2Service });
  await undoManagerV2.clearPersisted();
}
