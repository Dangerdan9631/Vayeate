import type { SetState } from './types';

/** Application teardown (stub). Persist state / cleanup; composed with clearPersistedUndo by app controller. */
export async function unloadApplication(_setState?: SetState): Promise<void> {
  // Stub: add persist preferences, etc. when needed.
}
