import type { TabId } from '../../../model/tab-id';
import { closedEyedropperUiState, type EyedropperUiState } from './eyedropper-ui-state';

export type { TabId } from '../../../model/tab-id';

export interface QueueStatusState {
  isProcessing: boolean;
  queueLength: number;
}

export interface BackgroundQueueStatusState {
  isProcessing: boolean;
  queueLength: number;
}

export interface MenuOpenState {
  fileOpen: boolean;
  editOpen: boolean;
  historyOpen: boolean;
  viewOpen: boolean;
}

export interface UiState {
  activeTabId: TabId;
  queueStatus: QueueStatusState;
  backgroundQueueStatus: BackgroundQueueStatusState;
  menuOpen: MenuOpenState;
  eyedropper: EyedropperUiState;
}

export const initialUiState: UiState = {
  activeTabId: 'catalogs',
  queueStatus: { isProcessing: false, queueLength: 0 },
  backgroundQueueStatus: { isProcessing: false, queueLength: 0 },
  menuOpen: {
    fileOpen: false,
    editOpen: false,
    historyOpen: false,
    viewOpen: false,
  },
  eyedropper: closedEyedropperUiState,
};
