import type { MenuId, TabId } from '../../../model/app-ui';

export interface UiState {
  activeTabId: TabId;
  openMenu: MenuId | null;
}

export const initialUiState: UiState = {
  activeTabId: 'catalogs',
  openMenu: null,
};
