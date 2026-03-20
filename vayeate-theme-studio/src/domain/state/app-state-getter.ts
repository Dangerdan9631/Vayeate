import type { AppState } from './app-state';

export type GetAppState = () => AppState;

/** Class wrapper so tsyringe + `emitDecoratorMetadata` can resolve app-state reads without `@inject`. */
export class AppStateGetter {
  constructor(private readonly get: GetAppState) {}

  current(): AppState {
    return this.get();
  }
}
