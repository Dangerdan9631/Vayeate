import type { AppStateUpdate } from './app-state';

export type SetAppState = (update: AppStateUpdate) => void;

/** Class wrapper so tsyringe + `emitDecoratorMetadata` can resolve app state updates without `@inject`. */
export class AppStateSetter {
  constructor(private readonly set: SetAppState) {}

  apply(update: AppStateUpdate): void {
    this.set(update);
  }
}
