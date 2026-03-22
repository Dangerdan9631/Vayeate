import type { AppState } from './app-state';
import type { EyedropperUiState } from './eyedropper-ui-state';
import type { TabId } from './tab-id';

export type SetUiState = (update: UiStateUpdate) => void;
export type UiStateUpdate =
  | { type: 'SET_UI_ACTIVE_TAB_ID'; tabId: TabId }
  | { type: 'SET_UI_QUEUE_STATUS'; isProcessing: boolean; queueLength: number }
  | { type: 'SET_UI_EYEDROPPER'; eyedropper: EyedropperUiState };

export function uiStateReducer(state: AppState, update: UiStateUpdate): AppState {
  switch (update.type) {
    case 'SET_UI_ACTIVE_TAB_ID':
      return { ...state, ui: { ...state.ui, activeTabId: update.tabId } };
    case 'SET_UI_QUEUE_STATUS':
      return {
        ...state,
        ui: { ...state.ui, queueStatus: { isProcessing: update.isProcessing, queueLength: update.queueLength } },
      };
    case 'SET_UI_EYEDROPPER':
      return { ...state, ui: { ...state.ui, eyedropper: update.eyedropper } };
    default:
      return state;
  }
}
