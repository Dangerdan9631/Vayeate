export type TabId = 'catalogs' | 'templates' | 'themes';
export type MenuId = 'file' | 'edit' | 'history' | 'view';

export interface UiState {
  activeTabId: TabId;
  openMenu: MenuId | null;
}

export const initialUiState: UiState = {
  activeTabId: 'catalogs',
  openMenu: null,
};
