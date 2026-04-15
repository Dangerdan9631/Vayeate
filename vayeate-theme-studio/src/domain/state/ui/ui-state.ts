import type { TabId } from '../../../model/tab-id';

export type { TabId } from '../../../model/tab-id';

export interface MenuOpenState {
  fileOpen: boolean;
  editOpen: boolean;
  historyOpen: boolean;
  viewOpen: boolean;
}

export interface UiState {
  activeTabId: TabId;
  menuOpen: MenuOpenState;
}

export const initialUiState: UiState = {
  activeTabId: 'catalogs',
  menuOpen: {
    fileOpen: false,
    editOpen: false,
    historyOpen: false,
    viewOpen: false,
  }
};
