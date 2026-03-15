import type { AppStateUpdate, TabId } from '../../state/app-state';

export type SetState = (update: AppStateUpdate) => void;

export function setActiveTab(setState: SetState, tabId: TabId): void {
  setState({ type: 'SET_ACTIVE_TAB', tabId });
}
