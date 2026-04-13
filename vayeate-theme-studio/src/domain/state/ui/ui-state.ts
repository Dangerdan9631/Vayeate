import type { TabId } from '../../../model/tab-id';
import { closedEyedropperUiState, type EyedropperUiState } from './eyedropper-ui-state';

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
  eyedropper: EyedropperUiState;
}

export const initialUiState: UiState = {
  activeTabId: 'catalogs',
  menuOpen: {
    fileOpen: false,
    editOpen: false,
    historyOpen: false,
    viewOpen: false,
  },
  eyedropper: closedEyedropperUiState,
};
