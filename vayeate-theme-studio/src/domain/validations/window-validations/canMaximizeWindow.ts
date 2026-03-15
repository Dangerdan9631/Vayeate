import type { AppState } from '../../state/app-state';

export type GetState = () => AppState;

/** Returns true if the window is not already maximized and can be maximized. */
export function canMaximizeWindow(getState: GetState): boolean {
  return !getState().window.isMaximized;
}
