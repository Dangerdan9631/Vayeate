import { singleton } from 'tsyringe';
import type { HandlerDeps } from '../handlers/handler-types';

/** Supplies current React-bound {@link HandlerDeps} for {@link ActionQueue}. */
@singleton()
export class HandlerDepsSource {
  private getCurrentDeps: (() => HandlerDeps) | null = null;

  setGetter(getter: () => HandlerDeps): void {
    this.getCurrentDeps = getter;
  }

  get(): HandlerDeps {
    if (!this.getCurrentDeps) {
      throw new Error('HandlerDepsSource getter is not configured.');
    }
    return this.getCurrentDeps();
  }
}
