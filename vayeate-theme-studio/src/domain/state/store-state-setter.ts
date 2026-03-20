import type { SetStoreState, StoreStateUpdate } from './store-state-reducer';

/** Class wrapper so tsyringe + `emitDecoratorMetadata` can resolve store state updates without `@inject`. */
export class StoreStateSetter {
  constructor(private readonly set: SetStoreState) {}

  apply(update: StoreStateUpdate): void {
    this.set(update);
  }
}
