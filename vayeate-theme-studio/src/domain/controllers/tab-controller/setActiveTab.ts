import type { TabId } from '../../state/tab-id';
import type { SetUiState } from '../../state/ui-state-reducer';

export function setActiveTab(setUiState: SetUiState, tabId: TabId): void {
  setUiState({ type: 'SET_UI_ACTIVE_TAB_ID', tabId });
}
