import type { WindowState } from '../../state/window/window-state';

export type GetWindowState = () => WindowState;

export function canMinimizeWindow(getWindowState: GetWindowState): boolean {
  return !getWindowState().isMinimized;
}
