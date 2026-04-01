import type { AppState } from './app-state';
import type { EyedropperUiState } from './eyedropper-ui-state';
import type { TabId } from './tab-id';

export type SetUiState = (update: UiStateUpdate) => void;
export type UiStateUpdate =
  | { type: 'SET_UI_ACTIVE_TAB_ID'; tabId: TabId }
  | { type: 'SET_UI_ALL_MENUS_CLOSED' }
  | {
      type: 'SET_UI_MENU_OPEN_STATE';
      menuId: 'file' | 'edit' | 'history' | 'view';
      isOpen: boolean;
    }
  | { type: 'SET_UI_EYEDROPPER'; eyedropper: EyedropperUiState };

export function uiStateReducer(state: AppState, update: UiStateUpdate): AppState {
  switch (update.type) {
    case 'SET_UI_ACTIVE_TAB_ID':
      return { ...state, ui: { ...state.ui, activeTabId: update.tabId } };
    case 'SET_UI_ALL_MENUS_CLOSED':
      return {
        ...state,
        ui: {
          ...state.ui,
          menuOpen: {
            fileOpen: false,
            editOpen: false,
            historyOpen: false,
            viewOpen: false,
          },
        },
      };
    case 'SET_UI_MENU_OPEN_STATE': {
      const menuKeyById = {
        file: 'fileOpen',
        edit: 'editOpen',
        history: 'historyOpen',
        view: 'viewOpen',
      } as const;
      const menuKey = menuKeyById[update.menuId];
      return {
        ...state,
        ui: {
          ...state.ui,
          menuOpen: { ...state.ui.menuOpen, [menuKey]: update.isOpen },
        },
      };
    }
    case 'SET_UI_EYEDROPPER':
      return { ...state, ui: { ...state.ui, eyedropper: update.eyedropper } };
    default:
      return state;
  }
}
