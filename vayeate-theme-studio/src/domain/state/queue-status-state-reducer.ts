import type { AppState } from './app-state';
import type { QueueStatusState } from './ui-state';

export type QueueStatusStateUpdate = { type: 'SET_QUEUE_STATUS'; queueStatus: QueueStatusState };

export function queueStatusStateReducer(state: AppState, update: QueueStatusStateUpdate): AppState {
  switch (update.type) {
    case 'SET_QUEUE_STATUS':
      return {
        ...state,
        ui: {
          ...state.ui,
          queueStatus: update.queueStatus,
        },
      };
    default:
      return state;
  }
}
