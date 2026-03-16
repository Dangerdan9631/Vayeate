import type { TabId } from './tab-id';

export interface QueueStatusState {
  isProcessing: boolean;
  queueLength: number;
}

/** Parallel state: UI-only state (active tab, queue status, color scheme, etc.). */
export interface UiState {
  activeTabId: TabId;
  queueStatus: QueueStatusState;
  /** Color scheme for the UI. Persisted via config service. */
  colorScheme: 'light' | 'dark';
}
