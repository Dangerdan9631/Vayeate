import type { AppState } from '../app-state';
import type { QueueStatusState } from './ui-state';

export type QueueStatusStateUpdate = { type: 'SET_QUEUE_STATUS'; queueStatus: QueueStatusState };

export function queueStatusStateReducer(state: AppState, update: QueueStatusStateUpdate): AppState {
  return {
    ...state,
    ui: {
      ...state.ui,
      queueStatus: update.queueStatus,
    },
  };
}

export type SetQueueStatusState = (queueStatus: QueueStatusState) => void;
export class QueueStatusStateSetter {
  constructor(private readonly set: SetQueueStatusState) { }

  apply(queueStatus: QueueStatusState): void {
    this.set(queueStatus);
  }
}

export type GetQueueStatusState = () => QueueStatusState;
export class QueueStatusStateGetter {
  constructor(private readonly get: GetQueueStatusState) {}

  current(): QueueStatusState {
    return this.get();
  }
}
