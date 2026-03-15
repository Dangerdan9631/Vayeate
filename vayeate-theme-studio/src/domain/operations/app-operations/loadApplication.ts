import type { SetState } from './types';

/** Application bootstrap (stub). Load initial state / preferences; composed with clearPersistedUndo by app controller. */
export async function loadApplication(_setState?: SetState): Promise<void> {
  // Stub: add load preferences, restore window bounds, etc. when needed.
}
