import type { AppState } from '../app-state';
import type { TabId, UiState } from './ui-state';

export type UiStateUpdate =
  | { type: 'SET_UI_ACTIVE_TAB_ID'; tabId: TabId }
  | { type: 'SET_UI_ALL_MENUS_CLOSED' }
  | {
      type: 'SET_UI_MENU_OPEN_STATE';
      menuId: 'file' | 'edit' | 'history' | 'view';
      isOpen: boolean;
    };

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
    default:
      return state;
  }
}

export type SetUiState = (update: UiStateUpdate) => void;
export class UiStateSetter {
  constructor(private readonly set: SetUiState) { }

  apply(update: UiStateUpdate): void {
    this.set(update);
  }
}

export type GetUiState = () => UiState;
export class UiStateGetter {
  constructor(private readonly get: GetUiState) {}

  current(): UiState {
    return this.get();
  }
}
