import type { TabId } from '../ui/tabs';
import type { AppStateUpdate } from '../state/app-state';

export type SetState = (update: AppStateUpdate) => void;

export function handleTabBarOnSelect(setState: SetState, tabId: TabId): void {
  setState({ type: 'SET_ACTIVE_TAB', tabId });
}
