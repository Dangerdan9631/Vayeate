import type { TabId } from '../../state/tab-id';
import type { UiStateUpdate } from '../../state/ui-state-reducer';

export type SetUiState = (update: UiStateUpdate) => void;

export function setActiveTab(setUiState: SetUiState, tabId: TabId): void {
  setUiState({ type: 'SET_UI_ACTIVE_TAB_ID', tabId });
}
