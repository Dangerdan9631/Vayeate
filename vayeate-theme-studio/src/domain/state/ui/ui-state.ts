import type { MenuId, TabId } from '../../../model/app-ui';

/**
 * Shell-level UI state for the active editor tab and open application menu.
 */
export interface UiState {
  activeTabId: TabId;
  openMenu: MenuId | null;
}

/**
 * Default shell UI state on application start.
 */
export const initialUiState: UiState = {
  activeTabId: 'catalogs',
  openMenu: null,
};
