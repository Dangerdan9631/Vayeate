import type { TabId } from './tab-id';
import type { EyedropperUiState } from './eyedropper-ui-state';

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
