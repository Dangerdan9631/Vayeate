import type { AppStateUpdate } from '../state/app-state';
import { undoManagerV2 } from '../utils/undo-manager-v2';
import { undoManagerV2Service } from '../services/undo-manager-v2-service';

export type SetState = (update: AppStateUpdate) => void;

/** Clear in-memory undo stacks and delete persisted undo files (V2). Triggered on app load and unload. */
export async function clearPersistedUndo(): Promise<void> {
  undoManagerV2.configure({ persistence: undoManagerV2Service });
  await undoManagerV2.clearPersisted();
}

/**
 * Application bootstrap: clear persisted undo, then load initial state / subscriptions as needed.
 */
export async function loadApplication(_setState?: SetState): Promise<void> {
  await clearPersistedUndo();
}

/**
 * Application teardown: clear persisted undo, then persist state / cleanup as needed.
 */
export async function unloadApplication(_setState?: SetState): Promise<void> {
  await clearPersistedUndo();
}
