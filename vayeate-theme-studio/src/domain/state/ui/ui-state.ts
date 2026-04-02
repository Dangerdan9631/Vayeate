import { closedEyedropperUiState, type EyedropperUiState } from './eyedropper-ui-state';

export type TabId = 'catalogs' | 'templates' | 'themes';

export interface QueueStatusState {
  isProcessing: boolean;
  queueLength: number;
}

export interface MenuOpenState {
  fileOpen: boolean;
  editOpen: boolean;
  historyOpen: boolean;
  viewOpen: boolean;
}

/** Parallel state: UI-only state (active tab, queue status, etc.). */
export interface UiState {
  activeTabId: TabId;
  queueStatus: QueueStatusState;
  menuOpen: MenuOpenState;
  eyedropper: EyedropperUiState;
}

export const initialUiState: UiState = {
  activeTabId: 'catalogs',
  queueStatus: { isProcessing: false, queueLength: 0 },
  menuOpen: {
    fileOpen: false,
    editOpen: false,
    historyOpen: false,
    viewOpen: false,
  },
  eyedropper: closedEyedropperUiState,
};
