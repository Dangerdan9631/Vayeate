import type { SetUiState, UiStateUpdate } from './ui-state-reducer';

/** Class wrapper so tsyringe + `emitDecoratorMetadata` can resolve UI updates without `@inject`. */
export class UiStateSetter {
  constructor(private readonly set: SetUiState) {}

  apply(update: UiStateUpdate): void {
    this.set(update);
  }
}
