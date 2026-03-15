import type { AppState } from '../../state/app-state';

export type GetState = () => AppState;

/** Returns true if the window is not already minimized and can be minimized. */
export function canMinimizeWindow(getState: GetState): boolean {
  return !getState().window.isMinimized;
}
