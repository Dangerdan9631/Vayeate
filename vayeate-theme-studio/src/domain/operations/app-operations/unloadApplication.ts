import { singleton } from 'tsyringe';

/** Application teardown (stub). Persist state / cleanup; composed with clearPersistedUndo by app controller. */
@singleton()
export class UnloadApplication {
  async execute(): Promise<void> {
    // Stub: add persist preferences, etc. when needed.
  }
}
