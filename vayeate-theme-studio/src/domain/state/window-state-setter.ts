import type { WindowStateUpdate } from './window-state-reducer';

export type SetWindowStateFn = (update: WindowStateUpdate) => void;

/** Class wrapper so tsyringe + `emitDecoratorMetadata` can resolve window slice updates without `@inject`. */
export class WindowStateSetter {
  constructor(private readonly set: SetWindowStateFn) {}

  apply(update: WindowStateUpdate): void {
    this.set(update);
  }
}
