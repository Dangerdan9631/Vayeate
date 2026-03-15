import type { AppState } from '../../state/app-state';

export type GetState = () => AppState;

/** Returns true if the window is maximized or minimized and can be restored. */
export function canRestoreWindow(getState: GetState): boolean {
  const { isMaximized, isMinimized } = getState().window;
  return isMaximized || isMinimized;
}
