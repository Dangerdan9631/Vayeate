import type { AppState } from './app-state';
import type { Position, Size, WindowLoadState } from './window-state';

export type WindowStateUpdate =
  | { type: 'SET_WINDOW_LOAD_STATE'; value: WindowLoadState }
  | { type: 'SET_WINDOW_MINIMIZED'; value: boolean }
  | { type: 'SET_WINDOW_MAXIMIZED'; value: boolean }
  | { type: 'SET_WINDOW_SIZE'; size: Size }
  | { type: 'SET_WINDOW_POSITION'; position: Position }
  | { type: 'SET_VIEWPORT_SIZE'; size: Size };

export function windowStateReducer(state: AppState, update: WindowStateUpdate): AppState {
  switch (update.type) {
    case 'SET_WINDOW_LOAD_STATE':
      return { ...state, window: { ...state.window, loadState: update.value } };
    case 'SET_WINDOW_MINIMIZED':
      return { ...state, window: { ...state.window, isMinimized: update.value } };
    case 'SET_WINDOW_MAXIMIZED':
      return { ...state, window: { ...state.window, isMaximized: update.value } };
    case 'SET_WINDOW_SIZE':
      return { ...state, window: { ...state.window, size: update.size } };
    case 'SET_WINDOW_POSITION':
      return { ...state, window: { ...state.window, position: update.position } };
    case 'SET_VIEWPORT_SIZE':
      return { ...state, window: { ...state.window, viewport: update.size } };
    default:
      return state;
  }
}
