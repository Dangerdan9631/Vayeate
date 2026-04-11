import type { AppState } from '../app-state';
import type { BackgroundQueueStatusState } from './ui-state';

export type BackgroundQueueStatusStateUpdate = {
  type: 'SET_BACKGROUND_QUEUE_STATUS';
  backgroundQueueStatus: BackgroundQueueStatusState;
};

export function backgroundQueueStatusStateReducer(
  state: AppState,
  update: BackgroundQueueStatusStateUpdate,
): AppState {
  return {
    ...state,
    ui: {
      ...state.ui,
      backgroundQueueStatus: update.backgroundQueueStatus,
    },
  };
}

export type SetBackgroundQueueStatusState = (backgroundQueueStatus: BackgroundQueueStatusState) => void;
export class BackgroundQueueStatusStateSetter {
  constructor(private readonly set: SetBackgroundQueueStatusState) {}

  apply(backgroundQueueStatus: BackgroundQueueStatusState): void {
    this.set(backgroundQueueStatus);
  }
}

export type GetBackgroundQueueStatusState = () => BackgroundQueueStatusState;
export class BackgroundQueueStatusStateGetter {
  constructor(private readonly get: GetBackgroundQueueStatusState) {}

  current(): BackgroundQueueStatusState {
    return this.get();
  }
}
